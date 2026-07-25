// Cloudflare Pages Function
// Recoit un email depuis le formulaire du site et l'ajoute a la liste Brevo.
// La cle API Brevo est lue depuis une variable d'environnement (jamais dans le code).
// A configurer dans Cloudflare : Pages > votre projet > Settings > Environment variables
//   Nom : BREVO_API_KEY   Valeur : la cle API Brevo (xkeysib-...)

const BREVO_LIST_ID = 2; // Id de la liste "Votre premiere liste"

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const data = await request.json();
    const email = (data.email || "").trim();

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ ok: false, error: "Adresse email invalide." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const apiKey = env.BREVO_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ ok: false, error: "Configuration manquante." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify({
        email: email,
        listIds: [BREVO_LIST_ID],
        updateEnabled: true
      })
    });

    if (brevoRes.ok || brevoRes.status === 204) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const errText = await brevoRes.text();
    return new Response(JSON.stringify({ ok: false, error: "Brevo a refuse la demande.", detail: errText }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: "Erreur serveur." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
