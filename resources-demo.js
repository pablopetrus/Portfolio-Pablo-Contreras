import './editorial-language.js';
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
