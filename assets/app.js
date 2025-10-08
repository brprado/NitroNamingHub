const { createApp, computed } = Vue;

const PROHIBITED_REGEX = /[|;:\/\\\[\]{}]/g; // | ; : / \ [ ] { } (para replace)
const PROHIBITED_TEST = /[|;:\/\\\[\]{}]/; // versão sem flag global (para test)

createApp({
  data() {
    return {
      activeTab: 'campanhas',
      isDarkMode: true, // Começa no modo dark
      redes: ["Google", "Facebook"],
      posicionamentos: ["YT", "Display", "Search"],
      redeTrafegoOpts: [
        { label: 'Facebook', value: 'FB' },
        { label: 'Google', value: 'Google' },
      ],
      showBrackets: true,
      form: {
        siglaGestor: "",
        rede: "Google",
        posicionamento: "YT",
        oferta: "",
        pais: "USA",
        estrutura: "",
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
        variacao: "",
        hook: "",
        avatar: "",
        avatarTipo: "S", // S = não famoso, F = famoso
        editor: "",
      },
      copied: false,
    };
  },
  computed: {
    isValid() {
      // Validação baseada na rede selecionada
      let requiredFilled;
      let combined;
      
      if (this.form.rede === 'Facebook') {
        // Facebook: BM é obrigatório, posicionamento não
        requiredFilled = this.form.siglaGestor && this.form.rede && this.form.bm && this.form.ca && this.form.oferta && this.form.pais && this.form.nomeCampanha;
        combined = `${this.form.siglaGestor}${this.form.bm}${this.form.ca}${this.form.oferta}${this.form.pais}${this.form.nomeCampanha}`;
      } else {
        // Google: Posicionamento é obrigatório, BM não
        requiredFilled = this.form.siglaGestor && this.form.rede && this.form.posicionamento && this.form.ca && this.form.oferta && this.form.pais && this.form.nomeCampanha;
        combined = `${this.form.siglaGestor}${this.form.posicionamento}${this.form.ca}${this.form.oferta}${this.form.pais}${this.form.nomeCampanha}`;
      }
      
      const noProhibited = !PROHIBITED_TEST.test(combined);
      const adOk = Number(this.form.adNumCampaign) >= 0;
      return Boolean(requiredFilled && noProhibited && adOk);
    },
    // Preview Campanhas conforme especificação
    preview() {
      const sep = " - ";
      const p2 = (n) => {
        const num = Number(n ?? 0);
        if (Number.isInteger(num)) {
          return String(num).padStart(2, "0");
        } else {
          return String(num);
        }
      };
      const adToken = `AD${p2(this.form.adNumCampaign)}`;
      const withToken = (value) => {
        const val = value ?? "";
        return this.showBrackets ? (val ? `[${val}]` : "") : val;
      };
      const formatDate = (iso) => {
        if (!iso) return "";
        const [y,m,d] = iso.split('-');
        if (!y || !m || !d) return "";
        return `${d}/${m}/${y}`;
      };
      
      // Determina o formato baseado na rede
      if (this.form.rede === 'Facebook') {
        // Padrão Facebook: [GESTOR] - [REDE DE TRÁFEGO] - [BM] - [CA] - [OFERTA] - [PAÍS] - [AD] - [ESTRUTURA] - [NOME DA CAMPANHA] - [DATA DO DIA 1 DA CAMPANHA]
        const parts = [
          withToken((this.form.siglaGestor || "").toUpperCase()), // [GESTOR]
          withToken("FB"),                                         // [REDE DE TRÁFEGO] - sempre FB para Facebook
          withToken((this.form.bm || "").toUpperCase()),           // [BM]
          withToken((this.form.ca || "").toUpperCase()),           // [CA]
          withToken((this.form.oferta || "").toUpperCase()),       // [OFERTA]
          withToken((this.form.pais || "").toUpperCase()),         // [PAÍS]
          withToken(adToken),                                      // [AD]
          withToken((this.form.estrutura || "").toUpperCase()),    // [ESTRUTURA]
          withToken((this.form.nomeCampanha || "").toUpperCase()), // [NOME DA CAMPANHA]
          withToken(formatDate(this.form.dataDiaUmRaw)),           // [DATA DO DIA 1]
        ];
        return parts.join(sep);
      } else {
        // Padrão Google: [GESTOR] - [REDE DE TRÁFEGO] - [POSICIONAMENTO] - [CA] - [OFERTA] - [PAÍS] - [AD] - [ESTRUTURA] - [NOME DA CAMPANHA] - [DATA DO DIA 1 DA CAMPANHA]
        const parts = [
          withToken((this.form.siglaGestor || "").toUpperCase()), // [GESTOR]
          withToken("Google"),                                     // [REDE DE TRÁFEGO] - sempre Google
          withToken((this.form.posicionamento || "").toUpperCase()), // [POSICIONAMENTO]
          withToken((this.form.ca || "").toUpperCase()),           // [CA]
          withToken((this.form.oferta || "").toUpperCase()),       // [OFERTA]
          withToken((this.form.pais || "").toUpperCase()),         // [PAÍS]
          withToken(adToken),                                      // [AD]
          withToken((this.form.estrutura || "").toUpperCase()),    // [ESTRUTURA]
          withToken((this.form.nomeCampanha || "").toUpperCase()), // [NOME DA CAMPANHA]
          withToken(formatDate(this.form.dataDiaUmRaw)),           // [DATA DO DIA 1]
        ];
        return parts.join(sep);
      }
    },
    posicionamentosOptions() {
      if (this.form.rede === 'Facebook') {
        // Facebook não tem posicionamento, retorna array vazio
        return [];
      }
      // Google tem posicionamento: YT, Display, Search
      return this.posicionamentos;
    },
    isValidAds() {
      const requiredFilled = this.formAds.copy && this.formAds.redeTrafego && this.formAds.oferta && this.formAds.variacao && this.formAds.hook && this.formAds.avatar && (this.formAds.adNum !== null && this.formAds.adNum !== undefined);
      const combined = `${this.formAds.copy}${this.formAds.redeTrafego}${this.formAds.oferta}${this.formAds.variacao}${this.formAds.hook}${this.formAds.avatar}${this.formAds.editor}`;
      const noProhibited = !PROHIBITED_TEST.test(combined);
      const adOk = Number(this.formAds.adNum) >= 0;
      return Boolean(requiredFilled && noProhibited && adOk);
    },
    previewAds() {
      const p2 = (n) => {
        const num = Number(n ?? 0);
        if (Number.isInteger(num)) {
          return String(num).padStart(2, "0");
        } else {
          return String(num);
        }
      };
      const adToken = `AD${p2(this.formAds.adNum)}`;
      const withToken = (value) => {
        const val = value ?? "";
        return this.showBrackets ? (val ? `[${val}]` : "") : val;
      };
      
      // Padrão: [COPY][REDE][OFERTA][AD][Variacao][Hook][Avatar.S/F][EDITOR]
      const avatarComplete = this.formAds.avatar ? `${this.formAds.avatar}.${this.formAds.avatarTipo}` : "";
      const editorValue = this.formAds.editor || "XX"; // Se não informado, usa 'XX'
      
      // Mapear Google para YT na pré-visualização, mantendo outras redes inalteradas
      const redeDisplay = this.formAds.redeTrafego === "Google" ? "YT" : (this.formAds.redeTrafego || "");
      
      const parts = [
        withToken((this.formAds.copy || "").toUpperCase()),
        withToken(redeDisplay.toUpperCase()),
        withToken((this.formAds.oferta || "").toUpperCase()),
        withToken(adToken),
        withToken((this.formAds.variacao || "").toUpperCase()),
        withToken((this.formAds.hook || "").toUpperCase()),
        withToken(avatarComplete.toUpperCase()),
        withToken(editorValue.toUpperCase()),
      ];
      
      return parts.join(" - ");
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
    padNumber(field) {
      let value = Number(this.form[field] ?? 0);
      if (Number.isNaN(value)) value = 0;
      value = Math.max(0, value);
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
      value = Math.max(0, value);
      this.formAds[field] = value;
    },
    async copyToClipboard() {
      try {
        await navigator.clipboard.writeText(this.preview);
        this.showToast("Texto copiado com sucesso!");
        this.copied = true;
        setTimeout(() => (this.copied = false), 1500);
      } catch (e) {
        console.error(e);
        this.showToast("Erro ao copiar texto", "error");
      }
    },
    async copyAds() {
      try {
        await navigator.clipboard.writeText(this.previewAds);
        this.showToast("Texto copiado com sucesso!");
        this.copied = true;
        setTimeout(() => (this.copied = false), 1500);
      } catch (e) {
        console.error(e);
        this.showToast("Erro ao copiar texto", "error");
      }
    },
    toggleTooltip(event) {
      event.preventDefault();
      event.stopPropagation();
      
      // Remove active de todos os tooltips
      document.querySelectorAll('.field-with-tooltip.active').forEach(el => {
        el.classList.remove('active');
      });
      
      // Adiciona active apenas no tooltip clicado
      const tooltipElement = event.target.closest('.field-with-tooltip');
      if (tooltipElement) {
        tooltipElement.classList.add('active');
      }
    },
    hideAllTooltips() {
      // Remove active de todos os tooltips
      document.querySelectorAll('.field-with-tooltip.active').forEach(el => {
        el.classList.remove('active');
      });
    },
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      this.applyTheme();
      // Salva a preferência no localStorage
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    },
    applyTheme() {
      const html = document.documentElement;
      if (this.isDarkMode) {
        html.removeAttribute('data-theme');
      } else {
        html.setAttribute('data-theme', 'light');
      }
    },
    loadTheme() {
      // Carrega a preferência salva no localStorage
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light') {
        this.isDarkMode = false;
      } else if (savedTheme === 'dark') {
        this.isDarkMode = true;
      } else {
        // Se não há preferência salva, detecta a preferência do sistema
        this.isDarkMode = !window.matchMedia('(prefers-color-scheme: light)').matches;
      }
      this.applyTheme();
    },
    showToast(message, type = "success") {
      // Remove toast existente se houver
      const existingToast = document.querySelector('.toast');
      if (existingToast) {
        existingToast.remove();
      }
      
      // Cria novo toast
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      
      if (type === "error") {
        toast.style.background = 'var(--danger)';
        toast.style.setProperty('--toast-icon', '❌');
      }
      
      document.body.appendChild(toast);
      
      // Mostra o toast
      setTimeout(() => toast.classList.add('show'), 100);
      
      // Remove o toast após 3 segundos
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
  },
  mounted() {
    // Carrega o tema salvo ou detecta a preferência do sistema
    this.loadTheme();
    
    // Adiciona event listener para cliques fora dos tooltips
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.field-with-tooltip')) {
        this.hideAllTooltips();
      }
    });

    // Escuta mudanças na preferência de tema do sistema
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.isDarkMode = !e.matches;
        this.applyTheme();
      }
    });
  },
  watch: {
    'form.rede'(val) {
      const opts = this.posicionamentosOptions;
      if (!opts.includes(this.form.posicionamento)) {
        this.form.posicionamento = opts[0] || '';
      }
      // Reset BM quando muda para Google (não é usado)
      if (val === 'Google') {
        this.form.bm = '';
      }
      // Reset posicionamento quando muda para Facebook (não é usado)
      if (val === 'Facebook') {
        this.form.posicionamento = '';
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
