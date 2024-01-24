import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  })
}

export function writeToClipboard(text: string){
  if (!navigator.clipboard) {
    return new Promise((resolve, reject) => {
      try {
        const input = document.createElement('textarea');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('Copy');
        document.body.removeChild(input);
        resolve(null);
      } catch (error) {
        reject(error);
      }
    });
  } else {
    return navigator.clipboard.writeText(text);
  }
};
