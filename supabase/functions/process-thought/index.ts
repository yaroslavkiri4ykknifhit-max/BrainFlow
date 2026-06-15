import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || !text.trim()) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a data parsing engine for BrainFlow. Analyze the user's raw input.
1. CATEGORY: Is it a 'task', 'goal', or 'idea'?
2. DEADLINE: Extract implied timeline ('today', 'tomorrow', or 'null').
3. REFORMAT: Create a clear title (max 6 words) and short description.
Output STRICTLY as JSON: { "items": [ { "type": "...", "timeline": "...", "title": "...", "description": "..." } ] }.
Respond in Russian.`,
          },
          { role: "user", content: text },
        ],
        temperature: 0.2,
        max_tokens: 1024,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      throw new Error(`Groq API error: ${err}`);
    }

    const groqData = await groqRes.json();
    const content = groqData.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");

    const parsed = JSON.parse(jsonMatch[0]);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: dump, error: dumpErr } = await supabase
      .from("dumps")
      .insert({ raw_text: text })
      .select()
      .single();

    if (dumpErr) throw dumpErr;

    const items = parsed.items.map((item: any) => ({
      dump_id: dump.id,
      text: `${item.title}. ${item.description}`,
      category: item.type,
      timeline: item.timeline,
      completed: false,
    }));

    const { error: itemsErr } = await supabase.from("items").insert(items);
    if (itemsErr) throw itemsErr;

    return new Response(JSON.stringify({ success: true, items: parsed.items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
