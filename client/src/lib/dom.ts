import { useEffect } from 'react';

export function usePageMeta(title: string, bodyClassName?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    if (!bodyClassName) {
      return () => {
        document.title = previousTitle;
      };
    }

    document.body.classList.add(bodyClassName);

    return () => {
      document.title = previousTitle;
      document.body.classList.remove(bodyClassName);
    };
  }, [bodyClassName, title]);
}
