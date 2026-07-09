export function initKnowledgePages() {
  initDocsThemeSync();
  initManualPage();
  initPrivacyPage();
}

function initDocsThemeSync() {
  const applyThemeLabel = () => {
    const theme = document.documentElement.classList.contains('dark') ? 'Dark' : 'Light';
    document.querySelectorAll('[data-doc-theme-label]').forEach(label => {
      label.textContent = theme;
    });
  };

  document.addEventListener('jorgy:theme-change', applyThemeLabel);
  applyThemeLabel();
}

function initManualPage() {
  const page = document.getElementById('owners-manual-page');
  if (!page) return;

  const searchInput = document.getElementById('manual-search');
  const topicButtons = Array.from(document.querySelectorAll('[data-manual-topic]'));
  const articles = Array.from(document.querySelectorAll('[data-manual-article]'));
  const emptyState = document.getElementById('manual-empty-state');
  const expandAll = document.getElementById('manual-expand-all');
  const collapseAll = document.getElementById('manual-collapse-all');
  const progressBar = document.getElementById('manual-reading-progress');

  const setActiveTopic = topic => {
    topicButtons.forEach(button => {
      const active = button.dataset.manualTopic === topic;
      button.classList.toggle('bg-emerald-600', active);
      button.classList.toggle('text-white', active);
      button.classList.toggle('border-emerald-600', active);
      button.classList.toggle('bg-white', !active);
      button.classList.toggle('dark:bg-[#16171d]', !active);
      button.classList.toggle('text-neutral-700', !active);
      button.classList.toggle('dark:text-neutral-300', !active);
      button.classList.toggle('border-neutral-200', !active);
      button.classList.toggle('dark:border-neutral-800', !active);
    });
  };

  const filterManual = () => {
    const term = (searchInput?.value || '').toLowerCase().trim();
    const activeTopic = document.querySelector('[data-manual-topic].bg-emerald-600')?.dataset.manualTopic || 'all';
    let visibleCount = 0;

    articles.forEach(article => {
      const topicMatch = activeTopic === 'all' || article.dataset.manualArticle === activeTopic;
      const textMatch = !term || article.textContent.toLowerCase().includes(term);
      const visible = topicMatch && textMatch;
      article.classList.toggle('hidden', !visible);
      if (visible) visibleCount += 1;
    });

    emptyState?.classList.toggle('hidden', visibleCount !== 0);
  };

  topicButtons.forEach(button => {
    button.addEventListener('click', () => {
      setActiveTopic(button.dataset.manualTopic);
      filterManual();
    });
  });

  searchInput?.addEventListener('input', filterManual);

  expandAll?.addEventListener('click', () => {
    document.querySelectorAll('[data-manual-panel]').forEach(panel => panel.classList.remove('hidden'));
  });

  collapseAll?.addEventListener('click', () => {
    document.querySelectorAll('[data-manual-panel]').forEach(panel => panel.classList.add('hidden'));
  });

  document.querySelectorAll('[data-manual-toggle]').forEach(button => {
    button.addEventListener('click', () => {
      const panel = button.closest('[data-manual-article]')?.querySelector('[data-manual-panel]');
      panel?.classList.toggle('hidden');
    });
  });

  document.querySelectorAll('[data-copy-manual]').forEach(button => {
    button.addEventListener('click', async () => {
      const article = button.closest('[data-manual-article]');
      const text = article?.innerText.trim();
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
        const original = button.textContent;
        button.textContent = 'Copied';
        setTimeout(() => {
          button.textContent = original;
        }, 1200);
      } catch {
        button.textContent = 'Copy failed';
      }
    });
  });

  window.addEventListener('scroll', () => {
    if (!progressBar) return;
    const scrollTop = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(100, (scrollTop / max) * 100) : 0;
    progressBar.style.width = `${progress}%`;
  }, { passive: true });

  setActiveTopic('all');
  filterManual();
}

function initPrivacyPage() {
  const page = document.getElementById('privacy-policy-page');
  if (!page) return;

  const navLinks = Array.from(document.querySelectorAll('[data-policy-nav]'));
  const sections = Array.from(document.querySelectorAll('[data-policy-section]'));
  const searchInput = document.getElementById('policy-search');
  const printButton = document.getElementById('policy-print');
  const copyButton = document.getElementById('policy-copy-summary');
  const dataCards = Array.from(document.querySelectorAll('[data-policy-card]'));

  const setActive = id => {
    navLinks.forEach(link => {
      const active = link.dataset.policyNav === id;
      link.classList.toggle('bg-neutral-900', active);
      link.classList.toggle('dark:bg-emerald-500', active);
      link.classList.toggle('text-white', active);
      link.classList.toggle('dark:text-white', active);
      link.classList.toggle('text-neutral-600', !active);
      link.classList.toggle('dark:text-neutral-400', !active);
    });
  };

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById(link.dataset.policyNav)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActive(link.dataset.policyNav);
    });
  });

  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActive(visible.target.id);
  }, { rootMargin: '-20% 0px -65% 0px', threshold: [0.1, 0.25, 0.5] });

  sections.forEach(section => observer.observe(section));

  searchInput?.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase().trim();
    sections.forEach(section => {
      section.classList.toggle('hidden', term && !section.textContent.toLowerCase().includes(term));
    });
    dataCards.forEach(card => {
      card.classList.toggle('hidden', term && !card.textContent.toLowerCase().includes(term));
    });
  });

  printButton?.addEventListener('click', () => window.print());

  copyButton?.addEventListener('click', async () => {
    const summary = document.getElementById('policy-summary')?.innerText.trim();
    if (!summary) return;

    try {
      await navigator.clipboard.writeText(summary);
      copyButton.textContent = 'Summary copied';
      setTimeout(() => {
        copyButton.textContent = 'Copy summary';
      }, 1300);
    } catch {
      copyButton.textContent = 'Copy failed';
    }
  });

  setActive(sections[0]?.id || '');
}
