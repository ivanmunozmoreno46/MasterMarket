import {
  Users,
  Search,
  Lightbulb,
  Type,
  Image as ImageIcon,
  FileText,
  Mail,
  MonitorPlay,
  Share2,
  Workflow
} from 'lucide-react';
import React from 'react';

export type ToolConfig = {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  inputs: { id: string; label: string; type: string; placeholder: string }[];
};

export const tools: ToolConfig[] = [
  {
    id: 'business_search',
    name: 'Buscador de Negocios',
    icon: Search,
    description: 'Encuentra negocios reales para prospección basados en tus criterios de búsqueda.',
    inputs: [
      { id: 'query', label: 'Criterios de Búsqueda', type: 'textarea', placeholder: 'Ej. Clínicas dentales en Barcelona con buenas reseñas...' }
    ]
  },
  {
    id: 'brainstorming',
    name: 'Lluvia de Ideas',
    icon: Lightbulb,
    description: 'Genera ideas creativas de contenido y marketing enfocadas a una audiencia o canal.',
    inputs: [
      { id: 'context', label: 'Contexto / Proyecto', type: 'textarea', placeholder: 'Campaña de verano para marca de gafas de sol, público joven en TikTok...' }
    ]
  },
  {
    id: 'slogan_generator',
    name: 'Generador de Esloganes',
    icon: Type,
    description: 'Crea esloganes potentes y memorables para marcas y campañas.',
    inputs: [
      { id: 'brand', label: 'Marca y Producto', type: 'textarea', placeholder: 'Marca de zapatos ecológicos, cómodos y para el día a día...' }
    ]
  },
  {
    id: 'logo_generator',
    name: 'Prototipado de Logos',
    icon: ImageIcon,
    description: 'Obtén conceptos detallados de diseño listos para usarse como prompts en generadores de imágenes.',
    inputs: [
      { id: 'brand', label: 'Descripción de la Marca', type: 'textarea', placeholder: 'Restaurante vegano moderno, minimalista, colores tierra...' }
    ]
  },
  {
    id: 'brochure_generator',
    name: 'Generador de Folletos',
    icon: FileText,
    description: 'Estructura el copy de un folleto físico o PDF con titulares, secciones y CTAs.',
    inputs: [
      { id: 'product', label: 'Producto o Servicio', type: 'textarea', placeholder: 'Nuevo servicio de spa con piedras calientes y aromaterapia...' }
    ]
  },
  {
    id: 'email_generator',
    name: 'Email & Newsletter',
    icon: Mail,
    description: 'Redacta asuntos atractivos y cuerpos de correo de alta conversión.',
    inputs: [
      { id: 'goal', label: 'Objetivo del Email', type: 'textarea', placeholder: 'Anunciar rebajas del 50% de Black Friday a clientes VIP...' }
    ]
  },
  {
    id: 'banner_generator',
    name: 'Copy para Banners',
    icon: MonitorPlay,
    description: 'Genera el copy y la dirección visual para anuncios display y creatividades en redes.',
    inputs: [
      { id: 'campaign', label: 'Campaña y Audiencia', type: 'textarea', placeholder: 'Anuncio de retargeting para usuarios que abandonaron el carrito en un e-commerce...' }
    ]
  },
  {
    id: 'social_advisor',
    name: 'Consejero de Redes',
    icon: Share2,
    description: 'Estrategia personalizada sobre qué redes priorizar según los objetivos y el negocio.',
    inputs: [
      { id: 'business', label: 'Negocio, Objetivos y Público', type: 'textarea', placeholder: 'SaaS de software de Recursos Humanos enfocado en empresas de 50-200 empleados...' }
    ]
  },
  {
    id: 'automation_builder',
    name: 'Constructor de Automatizaciones',
    icon: Workflow,
    description: 'Prototipa flujos automatizados de marketing basados en triggers, condiciones y acciones.',
    inputs: [
      { id: 'process', label: 'Proceso o Dolor a Resolver', type: 'textarea', placeholder: 'Quiero automatizar qué hacer cuando recibo un nuevo lead en Facebook Ads...' }
    ]
  }
];
