export async function onRequestGet(context) {
    const db = context.env.DATABASE;
    if (!db) {
        return new Response(JSON.stringify({ error: "Database binding missing" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }

    const hours = await db.get("hours") === "true";
    const minutes = await db.get("minutes") === "true";
    const seconds = await db.get("seconds") === "true";
    
    return new Response(JSON.stringify({ hours, minutes, seconds }), {
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
        }
    });
}

export async function onRequestPost(context) {
    const db = context.env.DATABASE;
    if (!db) {
        return new Response(JSON.stringify({ error: "Database binding missing" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }

    let body;
    try {
        body = await context.request.json();
    } catch (e) {
        return new Response("Invalid JSON", { status: 400 });
    }
    const { segment } = body;
    
    if (segment !== "hours" && segment !== "minutes" && segment !== "seconds") {
        return new Response("Invalid segment", { status: 400 });
    }
    
    await db.put(segment, "true");
    
    return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
    });
}
