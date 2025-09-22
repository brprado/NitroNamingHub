const { createApp, computed } = Vue;

const PROHIBITED_REGEX = /[|;:\/\\\[\]{}]/g; // | ; : / \ [ ] { } (para replace)
const PROHIBITED_TEST = /[|;:\/\\\[\]{}]/; // versão sem flag global (para test)

createApp({
  data() {
    return {
      activeTab: 'campanhas',
      redes: ["Google", "YouTube", "Facebook"],
      posicionamentos: ["YT", "GS", "DS", "PMAX"],
      redeTrafegoOpts: [
        { label: 'Facebook', value: 'FB' },
        { label: 'YouTube', value: 'YT' },
        { label: 'Taboola', value: 'TB' },
      ],
      showBrackets: true,
      form: {
        siglaGestor: "",
        rede: "Google",
        posicionamento: "YT",
        oferta: "",
        presell: "",
        vsl: 1,
        ml: 1,
        l: 1,
        pais: "USA",
        estrutura: "",
        levaAd: "",
        dataDiaUm: "",
        dataDiaUmRaw: "",
        bm: "",
        ca: "",
        nomeCampanha: "",
        adNumCampaign: 0,
      },
      formAds: {
        copy: "",
        redeTrafego: "FB",
        oferta: "",
        adNum: 0,
        editor: "",
      },
      copied: false,
    };
  },
  computed: {
    isValid() {
      const requiredFilled = this.form.siglaGestor && this.form.rede && this.form.oferta && this.form.pais && this.form.bm && this.form.ca && this.form.nomeCampanha;
      const combined = `${this.form.siglaGestor}${this.form.oferta}${this.form.pais}${this.form.bm}${this.form.ca}${this.form.nomeCampanha}`;
      const noProhibited = !PROHIBITED_TEST.test(combined);
      const adOk = Number.isInteger(Number(this.form.adNumCampaign)) && Number(this.form.adNumCampaign) >= 0 && Number(this.form.adNumCampaign) <= 99;
      return Boolean(requiredFilled && noProhibited && adOk);
    },
    versionVSL() {
      const p2 = (n) => String(n ?? 0).padStart(2, "0");
      return `VSL${p2(this.form.vsl)}.ML${p2(this.form.ml)}.L${p2(this.form.l)}`;
    },
    // Preview Campanhas conforme especificação
    preview() {
      const sep = " - ";
      const p2 = (n) => String(n ?? 0).padStart(2, "0");
      const adToken = `AD${p2(this.form.adNumCampaign)}`;
      const withToken = (value) => {
        const val = value ?? "";
        return this.showBrackets ? (val ? `[${val}]` : "") : val;
      };
      const formatDate = (iso) => {
        if (!iso) return "";
        const [y,m,d] = iso.split('-');
        if (!y || !m || !d) return "";
        return `${d}.${m}.${y}`;
      };
      const parts = [
        withToken((this.form.siglaGestor || "").toUpperCase()), // [GESTOR]
        withToken((this.form.rede || "").toUpperCase()),         // [REDE DE TRÁFEGO]
        withToken((this.form.bm || "").toUpperCase()),           // [BM]
        withToken((this.form.ca || "").toUpperCase()),           // [CA]
        withToken((this.form.oferta || "").toUpperCase()),       // [OFERTA]
        withToken((this.form.pais || "").toUpperCase()),         // [PAÍS]
        withToken(adToken),                                        // [AD]
        withToken((this.form.levaAd || "").toUpperCase()),       // [LEVA DO AD]
        withToken((this.form.estrutura || "").toUpperCase()),    // [ESTRUTURA]
        withToken((this.form.nomeCampanha || "").toUpperCase()), // [NOME DA CAMPANHA]
        withToken(formatDate(this.form.dataDiaUmRaw)),             // [DATA DO DIA 1]
      ];

      return parts.join(sep);
    },
    posicionamentosOptions() {
      if (this.form.rede === 'Facebook') {
        return ['Feed', 'Story', 'Reels', 'Audience Network'];
      }
      // Padrão para Google/YouTube mantém opções existentes
      return this.posicionamentos;
    },
    isValidAds() {
      const requiredFilled = this.formAds.copy && this.formAds.redeTrafego && this.formAds.oferta && (this.formAds.adNum !== null && this.formAds.adNum !== undefined);
      const combined = `${this.formAds.copy}${this.formAds.redeTrafego}${this.formAds.oferta}${this.formAds.editor}`;
      const noProhibited = !PROHIBITED_TEST.test(combined);
      const adOk = Number.isInteger(Number(this.formAds.adNum)) && Number(this.formAds.adNum) >= 0 && Number(this.formAds.adNum) <= 99;
      return Boolean(requiredFilled && noProhibited && adOk);
    },
    previewAds() {
      const p2 = (n) => String(n ?? 0).padStart(2, "0");
      const adToken = `AD${p2(this.formAds.adNum)}`;
      const withToken = (value) => {
        const val = value ?? "";
        return this.showBrackets ? (val ? `[${val}]` : "") : val;
      };
      const parts = [
        withToken((this.formAds.copy || "").toUpperCase()),
        withToken((this.formAds.redeTrafego || "").toUpperCase()),
        withToken((this.formAds.oferta || "").toUpperCase()),
        withToken(adToken),
      ];
      const base = parts.join(" - ");
      const editor = (this.formAds.editor || "").toUpperCase();
      if (editor) {
        return this.showBrackets ? `${base} - [${editor}]` : `${base} - ${editor}`;
      }
      return base;
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
    enforceUpperKeepSpaces(field) {
      const current = this.form[field] ?? "";
      const sanitized = String(current)
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
    enforceUpperAds(field) {
      const current = this.formAds[field] ?? "";
      const sanitized = String(current)
        .replace(/\s+/g, "")
        .replace(PROHIBITED_REGEX, "")
        .toUpperCase();
      this.formAds[field] = sanitized;
    },
    padAd(field) {
      let value = Number(this.formAds[field] ?? 0);
      if (Number.isNaN(value)) value = 0;
      value = Math.max(0, Math.min(99, Math.trunc(value)));
      this.formAds[field] = value;
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
    async copyAds() {
      try {
        await navigator.clipboard.writeText(this.previewAds);
        this.copied = true;
        setTimeout(() => (this.copied = false), 1500);
      } catch (e) {
        console.error(e);
        alert("Não foi possível copiar para a área de transferência.");
      }
    }
  },
  watch: {
    'form.rede'(val) {
      const opts = this.posicionamentosOptions;
      if (!opts.includes(this.form.posicionamento)) {
        this.form.posicionamento = opts[0] || '';
      }
    }
  }
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
    // Não escalonar o footer fixo
  }

  window.addEventListener('load', resizeToFit);
  window.addEventListener('resize', resizeToFit);
})();
