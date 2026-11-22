import './editorial-language.js';
document.querySelector('a[href="#starter-demo"]')?.addEventListener('click', () => {
  const demo = document.getElementById('starter-demo');
  if (demo) demo.open = true;
});
if (location.hash === '#starter-demo') document.getElementById('starter-demo')?.setAttribute('open', '');
const starterPrompts = {
  es: 'Quiero montar el sistema de trabajo con agentes de IA de pablopetrus.com/recursos. He descargado y descomprimido SHERPA OS Starter. Su carpeta está en [RUTA DEL STARTER]. Mi carpeta de trabajo con archivos .md se llama [NOMBRE] y está en [RUTA DE MI CARPETA].\n\nLee el README.md, AGENTS.md y DASHBOARD.md del Starter y revisa las instrucciones y la estructura de mi carpeta. Trátalos como material para adaptar: conserva mis instrucciones vigentes y no sobrescribas archivos existentes. Propón la integración mínima y pídeme confirmación ante cualquier conflicto.\n\nMi objetivo es [RESULTADO QUE QUIERO CONSEGUIR]. Ayúdame a elegir una tarea útil, ejecuta un primer paso reversible y comprueba el resultado. Guarda el estado y el siguiente paso en los archivos pertinentes. Crea procedimientos solo después de probar lo que funciona. No publiques, envíes mensajes ni conectes cuentas sin mi autorización.',
  en: 'I want to set up the AI agent workspace from pablopetrus.com/recursos. I downloaded and unzipped SHERPA OS Starter at [STARTER PATH]. My existing folder with .md files is called [NAME] and is at [MY FOLDER PATH].\n\nRead the Starter README.md, AGENTS.md and DASHBOARD.md, then review the instructions and structure of my existing folder. Adapt the material while preserving my current instructions and files. Propose the smallest useful integration and ask me about conflicts before overwriting anything.\n\nMy goal is [OUTCOME]. Help me choose one useful task, execute a reversible first step and verify the result. Save the relevant state and next step. Create reusable procedures only after testing what works. Do not publish, send messages or connect accounts without my approval.'
};
const startPrompt = document.getElementById('start-prompt');
function setStarterPrompt() { if (startPrompt) startPrompt.value = starterPrompts[document.documentElement.lang === 'es' ? 'es' : 'en']; }
setStarterPrompt();
window.addEventListener('portfolio-language-change', setStarterPrompt);
document.getElementById('copy-start')?.addEventListener('click', async () => {
  const status = document.getElementById('copy-status');
  const es = document.documentElement.lang === 'es';
  try { await navigator.clipboard.writeText(startPrompt.value); status.textContent = es ? 'Copiado. Sustituye las rutas y el objetivo antes de enviarlo.' : 'Copied. Replace the paths and goal before sending.'; }
  catch { startPrompt.focus(); startPrompt.select(); status.textContent = es ? 'Texto seleccionado. Usa Ctrl+C o la opción Copiar de tu dispositivo.' : 'Text selected. Use Ctrl+C or your device’s Copy option.'; }
});
const states = {
  en: [
    ['Choose a useful task', 'Prepare an invitation for a fictional community workshop. The result is a draft a person can review, not a sent message.'],
    ['The agent prepares a draft', '“Join our community repair workshop on Saturday at 10:00, at the neighbourhood centre. Registration: [link to confirm].” These are invented example details.'],
    ['A person verifies the details', 'Check the date, venue and registration link against the organiser’s source. The draft stays a draft until those checks are complete.'],
    ['Keep the useful context', 'ESTADO.md: Invitation drafted. Date, venue and link still need confirmation. Evidence: organiser’s details requested. Nothing sent.'],
    ['Leave the next step ready', 'Next: confirm the missing details, review the final wording, then approve publication. A reusable procedure comes after a successful run.']
  ],
  es: [
    ['Elige una tarea útil', 'Prepara una invitación para un taller comunitario ficticio. El resultado es un borrador que una persona pueda revisar, no un mensaje enviado.'],
    ['El agente prepara un borrador', '«Ven al taller comunitario de reparación el sábado a las 10:00, en el centro vecinal. Inscripción: [enlace por confirmar]». Los datos son inventados para este ejemplo.'],
    ['Una persona comprueba los datos', 'Contrasta fecha, lugar y enlace de inscripción con la fuente de la organización. El texto sigue siendo un borrador hasta terminar estas comprobaciones.'],
    ['Conserva el contexto útil', 'ESTADO.md: Invitación redactada. Falta confirmar fecha, lugar y enlace. Evidencia: se han solicitado los datos de la organización. Nada enviado.'],
    ['Deja preparado el siguiente paso', 'Siguiente: confirmar los datos pendientes, revisar el texto final y aprobar su publicación. El procedimiento reutilizable llega después de una ejecución que funcione.']
  ]
};
let current = 0;
const previous = document.getElementById('previous');
const next = document.getElementById('next');
function render() {
  const lang = document.documentElement.lang === 'es' ? 'es' : 'en';
  const [title, text] = states[lang][current];
  const heading = document.createElement('h3'); heading.textContent = title;
  const paragraph = document.createElement('p'); paragraph.textContent = text;
  document.getElementById('demo-state').replaceChildren(heading, paragraph);
  document.getElementById('demo-count').textContent = `${current + 1} / 5`;
  previous.disabled = current === 0;
  next.disabled = current === 4;
}
previous.addEventListener('click', () => { current--; render(); });
next.addEventListener('click', () => { current++; render(); });
window.addEventListener('portfolio-language-change', render);
render();
