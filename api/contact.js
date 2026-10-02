module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const { name, email, whatsapp, project } = req.body || {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    (whatsapp !== undefined && typeof whatsapp !== "string") ||
    typeof project !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !project.trim()
  ) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const destination = process.env.CONTACT_EMAIL;
  const sender = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !destination || !sender) {
    return res.status(500).json({ error: "O envio de e-mail não está configurado." });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: sender,
        to: [destination],
        reply_to: email.trim(),
        subject: "Nova mensagem — Letra Viva Music",
        text: [
          `Nome: ${name.trim()}`,
          `E-mail: ${email.trim()}`,
          `WhatsApp: ${whatsapp?.trim() || "Não informado"}`,
          "",
          "Sobre a música:",
          project.trim()
        ].join("\n")
      })
    });

    if (!response.ok) {
      console.error("Falha no serviço de e-mail:", response.status);
      return res.status(502).json({ error: "Não foi possível enviar a mensagem agora." });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return res.status(500).json({ error: "Erro interno ao enviar a mensagem." });
  }
};
