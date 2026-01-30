
export enum UserRole {
  CONSUMER = 'CONSUMER',
  GENERATOR = 'GENERATOR',
  ADMIN = 'ADMIN'
}

export interface EnergyProvider {
  id?: string;
  name: string;
  type: 'Solar' | 'Eólica' | 'Hídrica' | 'Biomassa' | 'Híbrida';
  region: string;
  discount: number;
  rating: number;
  estimatedSavings: number;
  tag?: string;
  color: string;
  icon: string;
  status?: 'active' | 'pending' | 'inactive' | 'cancelled';
  commission?: number; // Percentual de comissão para a plataforma

  // Novos campos para Governança Admin
  responsibleName?: string;
  responsiblePhone?: string;

  capacity?: string | number;
  accessEmail?: string;
  accessPassword?: string;
  // Novos campos solcitados (Jan 2026)
  company?: string;
  landline?: string;
  city?: string;
  website?: string;
  annualRevenue?: number;
  logoUrl?: string | null; // Logo da usina para exibição no marketplace
}

export interface Concessionaire {
  id: string;
  name: string;
  responsible: string;
  contact: string;
  status: 'active' | 'inactive';
  region: string;
}

export interface Contract {
  id: string;
  client: string;
  type: string;
  region: string;
  energy: number;
  discount: number;
  status: 'Ativo' | 'Pendente' | 'Cancelado' | 'Vencido' | 'Em análise';
  validity: string;
}

export interface FinancialMetric {
  label: string;
  value: string;
  trend: number;
  subtext: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  billValue?: number;
  consumption?: number; // kWh
  supplier_id?: string; // Link to generator (table column)
  supplierId?: string; // Link to generator (camelCase)
  status?: string;
}
