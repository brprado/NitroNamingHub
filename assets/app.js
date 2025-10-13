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
        adNumCampaign: "",
      },
      formAds: {
        sequencia: null,
        copy: "",
        redeTrafego: "FB",
        oferta: "",
        adNum: "",
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
        requiredFilled = this.form.siglaGestor && this.form.rede && this.form.bm && this.form.ca && this.form.oferta && this.form.pais && this.form.nomeCampanha && this.form.dataDiaUmRaw;
        combined = `${this.form.siglaGestor}${this.form.bm}${this.form.ca}${this.form.oferta}${this.form.pais}${this.form.nomeCampanha}`;
      } else {
        // Google: Posicionamento é obrigatório, BM não
        requiredFilled = this.form.siglaGestor && this.form.rede && this.form.posicionamento && this.form.ca && this.form.oferta && this.form.pais && this.form.nomeCampanha && this.form.dataDiaUmRaw;
        combined = `${this.form.siglaGestor}${this.form.posicionamento}${this.form.ca}${this.form.oferta}${this.form.pais}${this.form.nomeCampanha}`;
      }
      
      const noProhibited = !PROHIBITED_TEST.test(combined);
      const adOk = this.form.adNumCampaign && this.form.adNumCampaign.trim().length > 0;
      return Boolean(requiredFilled && noProhibited && adOk);
    },
    // Preview Campanhas conforme especificação
    preview() {
      // Função para limpar espaços e hífens
      const cleanValue = (value) => {
        return String(value || "").replace(/[\s-]/g, "").toUpperCase();
      };
      
      // Função especial para estrutura que preserva hífens
      const cleanValueKeepHyphens = (value) => {
        return String(value || "").replace(/\s/g, "").toUpperCase();
      };
      
      const adToken = cleanValue(this.form.adNumCampaign);
      const withToken = (value) => {
        const val = cleanValue(value);
        return val ? `[${val}]` : "";
      };
      
      const withTokenKeepHyphens = (value) => {
        const val = cleanValueKeepHyphens(value);
        return val ? `[${val}]` : "";
      };
      const formatDate = (iso) => {
        if (!iso) return "";
        const [y,m,d] = iso.split('-');
        if (!y || !m || !d) return "";
        return `${d}/${m}/${y}`;
      };
      
      // Determina o formato baseado na rede
      if (this.form.rede === 'Facebook') {
        // Padrão Facebook: [GESTOR][REDE DE TRÁFEGO][BM][CA][OFERTA][PAÍS][AD][ESTRUTURA][NOME DA CAMPANHA][DATA DO DIA 1 DA CAMPANHA]
        const parts = [
          withToken(this.form.siglaGestor), // [GESTOR]
          withToken("FB"),                  // [REDE DE TRÁFEGO] - sempre FB para Facebook
          withToken(this.form.bm),          // [BM]
          withToken(this.form.ca),          // [CA]
          withToken(this.form.oferta),      // [OFERTA]
          withToken(this.form.pais),        // [PAÍS]
          withToken(adToken),               // [AD]
          withTokenKeepHyphens(this.form.estrutura),   // [ESTRUTURA]
          withToken(this.form.nomeCampanha), // [NOME DA CAMPANHA]
          withToken(formatDate(this.form.dataDiaUmRaw)), // [DATA DO DIA 1]
        ];
        return parts.join("");
      } else {
        // Padrão Google: [GESTOR][REDE DE TRÁFEGO][POSICIONAMENTO][CA][OFERTA][PAÍS][AD][ESTRUTURA][NOME DA CAMPANHA][DATA DO DIA 1 DA CAMPANHA]
        const parts = [
          withToken(this.form.siglaGestor), // [GESTOR]
          withToken("Google"),              // [REDE DE TRÁFEGO] - sempre Google
          withToken(this.form.posicionamento), // [POSICIONAMENTO]
          withToken(this.form.ca),          // [CA]
          withToken(this.form.oferta),      // [OFERTA]
          withToken(this.form.pais),        // [PAÍS]
          withToken(adToken),               // [AD]
          withTokenKeepHyphens(this.form.estrutura),   // [ESTRUTURA]
          withToken(this.form.nomeCampanha), // [NOME DA CAMPANHA]
          withToken(formatDate(this.form.dataDiaUmRaw)), // [DATA DO DIA 1]
        ];
        return parts.join("");
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
      const requiredFilled = this.formAds.sequencia !== null && this.formAds.sequencia !== undefined && this.formAds.copy && this.formAds.redeTrafego && this.formAds.oferta && this.formAds.adNum && this.formAds.variacao && this.formAds.hook && this.formAds.avatar;
      const combined = `${this.formAds.copy}${this.formAds.redeTrafego}${this.formAds.oferta}${this.formAds.adNum}${this.formAds.variacao}${this.formAds.hook}${this.formAds.avatar}${this.formAds.editor}`;
      const noProhibited = !PROHIBITED_TEST.test(combined);
      const sequenciaOk = this.formAds.sequencia !== null && this.formAds.sequencia !== undefined && !isNaN(Number(this.formAds.sequencia));
      const adOk = this.formAds.adNum && this.formAds.adNum.trim().length > 0;
      return Boolean(requiredFilled && noProhibited && sequenciaOk && adOk);
    },
    previewAds() {
      // Função para limpar espaços e hífens
      const cleanValue = (value) => {
        return String(value || "").replace(/[\s-]/g, "").toUpperCase();
      };
      
      const withToken = (value) => {
        const val = cleanValue(value);
        return val ? `[${val}]` : "";
      };
      
      // Novo formato: [NÚMERO SEQUENCIAL][COPY][REDE][OFERTA][AD][V][H][A.S][EDITOR]
      const sequenciaValue = this.formAds.sequencia !== null && this.formAds.sequencia !== undefined ? String(this.formAds.sequencia) : "";
      const avatarComplete = this.formAds.avatar ? `${cleanValue(this.formAds.avatar)}.${this.formAds.avatarTipo}` : "";
      const editorValue = cleanValue(this.formAds.editor) || "XX"; // Se não informado, usa 'XX'
      
      // Mapear Google para YT na pré-visualização, mantendo outras redes inalteradas
      const redeDisplay = this.formAds.redeTrafego === "Google" ? "YT" : (this.formAds.redeTrafego || "");
      
      // Cada campo com seus próprios colchetes
      const parts = [
        withToken(sequenciaValue),           // [NÚMERO SEQUENCIAL]
        withToken(this.formAds.copy),        // [COPY]
        withToken(redeDisplay),              // [REDE]
        withToken(this.formAds.oferta),      // [OFERTA]
        withToken(this.formAds.adNum),       // [AD]
        withToken(this.formAds.variacao),    // [V]
        withToken(this.formAds.hook),        // [H]
        withToken(avatarComplete),           // [A.S]
        withToken(editorValue),              // [EDITOR]
      ];
      
      return parts.join("");
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
    enforceUpperAds(field) {
      const current = this.formAds[field] ?? "";
      const sanitized = String(current)
        .replace(/\s+/g, "")
        .replace(PROHIBITED_REGEX, "")
        .toUpperCase();
      this.formAds[field] = sanitized;
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

    // Desabilita menu de contexto (clique direito) na pré-visualização
    document.addEventListener('contextmenu', (event) => {
      if (event.target.closest('.preview-text')) {
        event.preventDefault();
        return false;
      }
    });

    // Desabilita atalhos de teclado (Ctrl+C, Ctrl+A, etc.) na pré-visualização
    document.addEventListener('keydown', (event) => {
      // Verifica se o foco está na área de pré-visualização ou se o elemento ativo é a pré-visualização
      const previewElement = event.target.closest('.preview-text') || document.activeElement.closest('.preview-text');
      
      if (previewElement) {
        // Desabilita Ctrl+C, Ctrl+A, Ctrl+X, Ctrl+V
        if (event.ctrlKey && (event.key === 'c' || event.key === 'a' || event.key === 'x' || event.key === 'v')) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
        // Desabilita F12 (DevTools)
        if (event.key === 'F12') {
          event.preventDefault();
          return false;
        }
      }
    });

    // Adiciona tabindex para tornar a pré-visualização focável e capturar eventos de teclado
    this.$nextTick(() => {
      const previewElements = document.querySelectorAll('.preview-text');
      previewElements.forEach(element => {
        element.setAttribute('tabindex', '0');
      });
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
