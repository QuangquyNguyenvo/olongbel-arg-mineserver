export async function onRequestPost(context) {
    const db = context.env.DATABASE;
    if (!db) {
        return new Response(JSON.stringify({ error: "Database binding missing" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }

    await db.delete("hours");
    await db.delete("minutes");
    await db.delete("seconds");
    
    return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
    });
}
