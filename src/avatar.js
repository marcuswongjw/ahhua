// Original vector character; all animation is local CSS, with no avatar service.
export function avatarMarkup() {
  return `<button id="ah-hua-avatar" class="host-avatar" data-state="idle" aria-label="Hear Ah Hua’s latest reply" title="Tap Ah Hua to hear a reply">
  <svg viewBox="0 0 120 132" aria-hidden="true" focusable="false">
    <circle cx="60" cy="65" r="53" fill="#e9eddb"/>
    <circle cx="60" cy="65" r="47" fill="none" stroke="#cbd6bb" stroke-dasharray="2 6"/>
    <g class="chef-body"><path d="M29 126v-15q0-22 31-22t31 22v15" fill="#faf9ec" stroke="#d6d7bf" stroke-width="2"/>
    <path d="m43 92 17 14 17-14v35H43Z" fill="#244e3c"/>
    <path d="M53 105h14v22H53Z" fill="#b5c2a0"/>
    <circle cx="60" cy="115" r="3" fill="#d5b471"/>
    <g class="chef-hand"><path d="M89 111q15-5 13-21" fill="none" stroke="#f2c49c" stroke-width="12" stroke-linecap="round"/><path d="M102 92v-8m-3 6-3-6m8 6 4-6" stroke="#f2c49c" stroke-width="5" stroke-linecap="round"/></g></g>
    <g class="chef-head"><ellipse cx="60" cy="65" rx="29" ry="32" fill="#efbd93"/><ellipse cx="31" cy="68" rx="5" ry="8" fill="#efbd93"/><ellipse cx="89" cy="68" rx="5" ry="8" fill="#efbd93"/>
    <path d="M33 59q-3-28 27-28t27 28l-5-8-3-11H41l-3 11Z" fill="#5c584b"/>
    <path d="M37 42q-17-5-10-20 5-9 16-6Q44 3 59 6q12-4 19 8 13-2 17 10 5 14-12 18" fill="#fffef5" stroke="#d4d6c3" stroke-width="2"/>
    <path d="M36 37h48v13H36Z" fill="#fffef5" stroke="#d4d6c3" stroke-width="2"/><path d="M53 18v14m15-14v14" stroke="#e5e6d6" stroke-width="2" stroke-linecap="round"/>
    <path d="m42 59 10-2m16 0 10 2" stroke="#756353" stroke-width="3" stroke-linecap="round"/>
    <g class="chef-eyes"><ellipse cx="48" cy="67" rx="3" ry="4" fill="#423d33"/><ellipse cx="72" cy="67" rx="3" ry="4" fill="#423d33"/></g>
    <path d="m59 69-3 9h7" fill="none" stroke="#d89870" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="41" cy="77" rx="6" ry="3" fill="#df947e" opacity=".6"/><ellipse cx="79" cy="77" rx="6" ry="3" fill="#df947e" opacity=".6"/>
    <path class="chef-smile" d="M51 84q9 9 18 0" fill="#fff9e7" stroke="#9b6751" stroke-width="2" stroke-linejoin="round"/>
    <ellipse class="chef-mouth" cx="60" cy="87" rx="7" ry="5" fill="#8d4f3d"/><path d="M49 81q6-4 11 0 5-4 11 0" fill="none" stroke="#777061" stroke-width="3" stroke-linecap="round"/></g>
  </svg><span class="avatar-sound" aria-hidden="true"><i></i><i></i><i></i></span></button>`;
}
