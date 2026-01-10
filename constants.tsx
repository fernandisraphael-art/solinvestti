
import React from 'react';
import { EnergyProvider, Contract } from './types';

export const ENERGY_PROVIDERS: EnergyProvider[] = [
  {
    id: '1',
    name: 'EcoPower Sul',
    type: 'Solar',
    region: 'Rio Grande do Sul',
    discount: 18,
    rating: 4.8,
    estimatedSavings: 145,
    tag: 'Maior Desconto',
    color: 'from-blue-600 to-green-500',
    icon: 'wb_sunny'
  },
  {
    id: '2',
    name: 'Solaris Tech',
    type: 'Solar',
    region: 'São Paulo',
    discount: 15,
    rating: 5.0,
    estimatedSavings: 120,
    tag: 'Melhor Avaliada',
    color: 'from-orange-500 to-yellow-500',
    icon: 'wb_sunny'
  },
  {
    id: '3',
    name: 'Ventos do Norte',
    type: 'Eólica',
    region: 'Ceará',
    discount: 12,
    rating: 4.5,
    estimatedSavings: 95,
    color: 'from-teal-700 to-green-600',
    icon: 'wind_power'
  },
  {
    id: '4',
    name: 'Luz do Sertão',
    type: 'Solar',
    region: 'Bahia',
    discount: 22,
    rating: 4.9,
    estimatedSavings: 210,
    tag: 'Destaque Nordeste',
    color: 'from-yellow-600 to-red-500',
    icon: 'wb_sunny'
  },
  {
    id: '5',
    name: 'Minas Solar',
    type: 'Solar',
    region: 'Minas Gerais',
    discount: 20,
    rating: 4.7,
    estimatedSavings: 180,
    color: 'from-green-600 to-emerald-500',
    icon: 'wb_sunny'
  }
];

export const MOCK_CONTRACTS: Contract[] = [
  {
    id: '#CT-2024-001',
    client: 'Indústrias Metalúrgicas SA',
    type: 'Empresa',
    region: 'Sudeste / SP',
    energy: 1.5,
    discount: 12,
    status: 'Ativo',
    validity: 'Jan 24 - Dez 28'
  },
  {
    id: '#CT-2024-042',
    client: 'Varejo Silva Ltda',
    type: 'Loja',
    region: 'Sul / PR',
    energy: 0.3,
    discount: 8,
    status: 'Pendente',
    validity: 'Ago 24 - Ago 29'
  }
];
