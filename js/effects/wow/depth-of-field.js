/**
 * WOW 9: DEPTH OF FIELD — Desenfoque selectivo
 * Las secciones fuera del viewport se desenfoccan progresivamente.
 * Intención: el foco es un acto de voluntad.
 * @module effects/wow/depth-of-field
 */
export const DepthOfField = {
  init() {
    const style = document.createElement('style');
    style.textContent = `
      .dof-section { transition: filter 0.8s cubic-bezier(0.22,1,0.36,1), opacity 0.8s cubic-bezier(0.22,1,0.36,1); }
      .dof-section.dof-far { filter: blur(3px); opacity: 0.7; }
      .dof-section.dof-near { filter: blur(1px); opacity: 0.85; }
      .dof-section.dof-focus { filter: blur(0); opacity: 1; }
    `;
    document.head.appendChild(style);

    const sections = document.querySelectorAll('.view, section');
    sections.forEach(s => s.classList.add('dof-section', 'dof-far'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        el.classList.remove('dof-far', 'dof-near', 'dof-focus');
        if (entry.intersectionRatio > 0.5) el.classList.add('dof-focus');
        else if (entry.intersectionRatio > 0.1) el.classList.add('dof-near');
        else el.classList.add('dof-far');
      });
    }, { threshold: [0, 0.1, 0.3, 0.5, 0.7, 1.0] });

    sections.forEach(s => observer.observe(s));
  }
};
