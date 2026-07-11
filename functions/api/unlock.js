const codes = {
    hours: "b538830b4c60cab60569c5a47e6e1733e69f745d2294b45414073d4f91c053c2",
    minutes: "b1837379ef38b51bb60e44a2261965c025186b84c717fc88fa05ee22fb5ca735",
    seconds: "116f73eeef6adac652994dac9e263724caef13db12d120a0c7ada855245fb05d"
};
const ADMIN_HASH = "99e476afc6494eb2fc49bcd4494d57507604ca6e9b78f1a45aec347d1ae5ccab";

async function sha256(message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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
    const { segment, code } = body;
    
    if (segment !== "hours" && segment !== "minutes" && segment !== "seconds") {
        return new Response("Invalid segment", { status: 400 });
    }

    if (!code) {
        return new Response(JSON.stringify({ error: "Verification code required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    const hashedInput = await sha256(code);
    const isSystemAdmin = hashedInput === ADMIN_HASH;

    if (!isSystemAdmin && hashedInput !== codes[segment]) {
        return new Response(JSON.stringify({ error: "Invalid verification code" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }
    
    // Enforce sequential solving: seconds -> minutes -> hours
    if (segment === "minutes") {
        const secondsUnlocked = await db.get("seconds") === "true";
        if (!secondsUnlocked) {
            return new Response(JSON.stringify({ error: "Seconds must be unlocked first" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }
    } else if (segment === "hours") {
        const minutesUnlocked = await db.get("minutes") === "true";
        if (!minutesUnlocked) {
            return new Response(JSON.stringify({ error: "Minutes must be unlocked first" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }
    }
    
    await db.put(segment, "true");
    
    return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
    });
}
