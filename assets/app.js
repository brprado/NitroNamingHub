const { createApp, computed } = Vue;

const PROHIBITED_REGEX = /[|;:\/\\\[\]{}]/g; // | ; : / \ [ ] { } (para replace)
const PROHIBITED_TEST = /[|;:\/\\\[\]{}]/; // versão sem flag global (para test)

createApp({
  data() {
    return {
      redes: ["Google", "YouTube"],
      posicionamentos: ["YT", "GS", "DS", "PMAX"],
      showBrackets: true,
      form: {
        siglaGestor: "",
        rede: "Google",
        posicionamento: "YT",
        oferta: "",
        nomeConta: "",
        presell: "",
        vsl: 1,
        ml: 1,
        l: 1,
      },
      copied: false,
    };
  },
  computed: {
    isValid() {
      const requiredFilled = this.form.siglaGestor && this.form.rede && this.form.posicionamento && this.form.oferta && this.form.nomeConta && this.form.presell;
      const combined = `${this.form.siglaGestor}${this.form.oferta}${this.form.nomeConta}${this.form.presell}`;
      const noProhibited = !PROHIBITED_TEST.test(combined);
      const numbersOk = [this.form.vsl, this.form.ml, this.form.l].every((n) => Number.isInteger(Number(n)) && Number(n) >= 0 && Number(n) <= 99);
      return Boolean(requiredFilled && noProhibited && numbersOk);
    },
    versionVSL() {
      const p2 = (n) => String(n ?? 0).padStart(2, "0");
      return `VSL${p2(this.form.vsl)}.ML${p2(this.form.ml)}.L${p2(this.form.l)}`;
    },
    preview() {
      const sep = " - ";
      // Mantém os valores do usuário; quando o toggle está ativo, apenas envolve os valores com colchetes
      const withToken = (label, value) => {
        const val = value ?? "";
        return this.showBrackets ? (val ? `[${val}]` : "") : val;
      };

      const parts = [
        withToken("SiglaGestor", this.form.siglaGestor || ""),
        withToken("Rede", (this.form.rede || "").toUpperCase()),
        withToken("Posicionamento", this.form.posicionamento || ""),
        withToken("Oferta", this.form.oferta || ""),
        withToken("NomeDaConta", (this.form.nomeConta || "").toUpperCase()),
        withToken("Presell", this.form.presell || ""),
        withToken("VersaoVSL", this.versionVSL),
      ];

      return parts.join(sep);
    },
  },
  methods: {
    enforceUpper(field) {
      const current = this.form[field] ?? "";
      const sanitized = current
        .replace(/\s+/g, "") // remove todos os espaços
        .replace(PROHIBITED_REGEX, "")
        .toUpperCase();
      this.form[field] = sanitized;
    },
    sanitizeFree(field) {
      const current = this.form[field] ?? "";
      // Remove todos os espaços e caracteres proibidos
      const sanitized = current
        .replace(/\s+/g, "")
        .replace(PROHIBITED_REGEX, "")
        .toUpperCase();
      this.form[field] = sanitized;
    },
    padVsl(field) {
      let value = Number(this.form[field] ?? 0);
      if (Number.isNaN(value)) value = 0;
      value = Math.max(0, Math.min(99, Math.trunc(value)));
      this.form[field] = value;
    },
    async copyToClipboard() {
      try {
        await navigator.clipboard.writeText(this.preview);
        this.copied = true;
        setTimeout(() => (this.copied = false), 1500);
      } catch (e) {
        console.error(e);
        alert("Não foi possível copiar para a área de transferência.");
      }
    },
  },
}).mount('#app');


// Ajuste responsivo para caber 100% na viewport sem scroll
(function() {
  function resizeToFit() {
    const container = document.querySelector('.container');
    const footer = document.querySelector('.site-footer');
    if (!container) return;

    // Reset scale antes de medir
    container.style.transform = 'scale(1)';

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Altura ocupada pelo conteúdo + footer (se existir)
    const containerRect = container.getBoundingClientRect();
    const footerRect = footer ? footer.getBoundingClientRect() : { height: 0 };
    const totalHeight = containerRect.height + (footerRect.height || 0);

    const heightScale = viewportHeight / totalHeight;
    const widthScale = viewportWidth / containerRect.width;

    // Usar o menor scale para garantir que nada extrapole
    const scale = Math.min(1, heightScale, widthScale);

    container.style.transform = `scale(${scale})`;
    // Garantir que o footer permaneça visível dentro da viewport
    if (footer) {
      footer.style.transform = `scale(${scale})`;
      footer.style.transformOrigin = 'top center';
    }
  }

  window.addEventListener('load', resizeToFit);
  window.addEventListener('resize', resizeToFit);
})();
