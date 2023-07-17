export function resizeTextarea(target: HTMLTextAreaElement) {
  target.style.height = "1lh";
  target.style.height = target.scrollHeight + "px";
}