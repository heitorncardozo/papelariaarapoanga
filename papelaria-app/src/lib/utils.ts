import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatDateShort(date: string | Date): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function truncateUUID(uuid: string): string {
  return uuid.slice(0, 8).toUpperCase()
}

export const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  em_separacao: 'Em separação',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

export const statusColors: Record<string, string> = {
  pendente: 'bg-amber/20 text-amber-800 border-amber/30',
  pago: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  em_separacao: 'bg-blue-100 text-blue-800 border-blue-200',
  entregue: 'bg-green-100 text-green-800 border-green-200',
  cancelado: 'bg-red-100 text-red-800 border-red-200',
}
