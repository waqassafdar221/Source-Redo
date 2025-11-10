import React, { useMemo, useRef, useState, useEffect } from "react";

// Lightweight, on-site rule-based assistant. No external APIs.
// Reads data from props.data (which should mirror data.json structure).
export const Chatbot = ({ data }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      text:
        "Hi! I'm your assistant. Ask me about our services, dropshipping (one-step or two-step), Amazon private label, pricing, shipping, or how to contact us.",
    },
  ]);
  const scrollRef = useRef(null);

  const services = useMemo(() => data?.Services || [], [data]);
  const contact = useMemo(() => data?.Contact || {}, [data]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const serviceNames = useMemo(
    () => services.map((s) => s.name),
    [services]
  );

  function normalize(str) {
    return (str || "")
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9\s/+-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const rules = useMemo(() => {
    const servicesList = serviceNames
      .map((n, i) => `${i + 1}. ${n}`)
      .join("\n");

    const servicesAnswer =
      services.length > 0
        ? `We currently offer:\n${servicesList}\n\nAsk about any service to learn more.`
        : "We offer product sourcing, sample evaluation/consolidation, inspections, freight forwarding, dropshipping, and private label support.";

    const dropshippingOne = services.find((s) =>
      normalize(s.name).includes("one-step") || normalize(s.name).includes("one step")
    );
    const dropshippingTwo = services.find((s) =>
      normalize(s.name).includes("two-step") || normalize(s.name).includes("two step")
    );
    const privateLabel = services.find((s) => normalize(s.name).includes("private label"));

    const contactLines = [
      contact?.email ? `Email: ${contact.email}` : null,
      contact?.phone ? `Phone/WhatsApp: ${contact.phone}` : null,
      contact?.address ? `Address: ${contact.address}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    return [
      {
        match: (q) => /service|offer|do you do|provide/.test(q),
        answer: () => servicesAnswer,
      },
      {
        match: (q) => /(drop|shipping).*one[- ]?step|one[- ]?step.*drop/.test(q) || /(ebay|walmart).*(one|1)[- ]?step/.test(q),
        answer: () =>
          dropshippingOne?.text ||
          "We support one-step dropshipping for marketplaces like eBay/Walmart with direct supplier-to-customer fulfillment and automated order routing.",
      },
      {
        match: (q) => /(drop|shipping).*two[- ]?step|two[- ]?step.*drop/.test(q) || /(ebay|walmart).*(two|2)[- ]?step/.test(q),
        answer: () =>
          dropshippingTwo?.text ||
          "We support two-step dropshipping workflows with an intermediate prep stage for relabeling/bundling and compliant tracking.",
      },
      {
        match: (q) => /(amazon|private).*label|pl\b/.test(q),
        answer: () =>
          privateLabel?.text ||
          "We provide end-to-end Amazon private label support: research, sourcing, branding/packaging, compliance, FNSKU prep, and FBA/FBM logistics.",
      },
      {
        match: (q) => /(price|cost|rate|fee)/.test(q),
        answer: () =>
          "Pricing depends on product scope, volume, and services selected. Share your requirements here or use the contact form, and we'll provide a tailored quote.",
      },
      {
        match: (q) => /(ship|shipping|freight|forward)/.test(q),
        answer: () =>
          services.find((s) => normalize(s.name).includes("freight"))?.text ||
          "We can manage logistics from China to worldwide destinations via air, sea, and land with end-to-end tracking.",
      },
      {
        match: (q) => /(sample|inspection|quality|consolidation)/.test(q),
        answer: () => {
          const sampleEval = services.find((s) => normalize(s.name).includes("sample evaluation"))?.text;
          const sampleCons = services.find((s) => normalize(s.name).includes("sample consolidation"))?.text;
          const inspect = services.find((s) => normalize(s.name).includes("inventory inspection"))?.text;
          return [sampleEval, sampleCons, inspect].filter(Boolean).join("\n\n") ||
            "We offer sample evaluation, consolidation, and inventory inspection to ensure quality and reduce costs before shipment.";
        },
      },
      {
        match: (q) => /(contact|email|phone|reach|talk)/.test(q),
        answer: () => (contactLines ? `You can reach us:\n${contactLines}` : "You can reach us via the Contact section of this page."),
      },
      {
        match: (q) => /(photo|video|media|images)/.test(q),
        answer: () =>
          services.find((s) => normalize(s.name).includes("photography"))?.text ||
          "We provide professional product photography and videography suitable for online stores and marketing.",
      },
    ];
  }, [serviceNames, services, contact]);

  function getAnswer(userText) {
    const q = normalize(userText);
    if (!q) return "Please enter a message.";

    for (const r of rules) {
      try {
        if (r.match(q)) return r.answer();
      } catch (_) {
        // ignore rule errors
      }
    }

    // Try to match a service by name keyword
    const direct = services.find((s) => q && normalize(s.name).includes(q));
    if (direct) return direct.text;

    // Fallback
    return (
      "I'm not sure yet, but here are some topics I can help with: services, dropshipping (one-step/two-step), Amazon private label, shipping, samples/inspection, contact and pricing."
    );
  }

  function sendMessage(text) {
    if (!text.trim()) return;
    const user = { role: "user", text };
    setMessages((prev) => [...prev, user]);

    const replyText = getAnswer(text);
    const assistant = { role: "assistant", text: replyText };
    setTimeout(() => {
      setMessages((prev) => [...prev, assistant]);
    }, 150);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const text = input;
    setInput("");
    sendMessage(text);
  }

  const quick = [
    { label: "Services", text: "What services do you offer?" },
    { label: "Dropshipping", text: "Do you do eBay/Walmart one-step dropshipping?" },
    { label: "Two-Step", text: "Do you support two-step dropshipping?" },
    { label: "Private Label", text: "Tell me about Amazon private label" },
    { label: "Shipping", text: "How do you handle shipping/freight?" },
    { label: "Contact", text: "How can I contact you?" },
    { label: "Pricing", text: "What are your prices?" },
  ];

  return (
    <>
      {/* Floating launcher button */}
      <button
        className="chatbot-launcher"
        aria-label={open ? "Hide assistant" : "Open assistant"}
        onClick={() => setOpen((v) => !v)}
      >
        <i className="fa fa-comments" />
      </button>

      {/* Chat window */}
      {open && (
        <div className="chatbot-window" role="dialog" aria-label="Assistant">
          <div className="chatbot-header">
            <div>
              <i className="fa fa-user-circle" aria-hidden="true" /> Assistant
            </div>
            <button className="chatbot-close" aria-label="Close" onClick={() => setOpen(false)}>
              <i className="fa fa-times" />
            </button>
          </div>
          <div className="chatbot-body" ref={scrollRef}>
            {messages.map((m, idx) => (
              <div key={idx} className={`chatbot-msg ${m.role}`}>
                <div className="bubble">{m.text}</div>
              </div>
            ))}
          </div>
          <div className="chatbot-quick">
            {quick.map((q) => (
              <button key={q.label} className="chip" onClick={() => sendMessage(q.text)}>
                {q.label}
              </button>
            ))}
          </div>
          <form className="chatbot-input" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Type your message"
            />
            <button type="submit" className="send">
              <i className="fa fa-paper-plane" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
