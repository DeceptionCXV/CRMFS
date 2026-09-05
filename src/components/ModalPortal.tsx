import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Mount an overlay on document.body so `fixed` covers the full viewport. */
export function portal(node: ReactNode) {
  return createPortal(node, document.body);
}

export default function ModalPortal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}
