export function createElement<T extends HTMLElement>(
  tag: string,
  className: string = "",
  textContent: string = "",
): T {
  const element = document.createElement(tag) as T;
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
}