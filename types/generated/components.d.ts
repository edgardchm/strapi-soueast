import type { Schema, Attribute } from '@strapi/strapi';

export interface SharedVersion extends Schema.Component {
  collectionName: 'components_shared_versions';
  info: {
    displayName: 'Version';
    description: 'Variante de motor/transmisi\u00F3n disponible para un modelo';
    icon: 'cog';
  };
  attributes: {
    nombre: Attribute.String & Attribute.Required;
  };
}

export interface SharedSocialLink extends Schema.Component {
  collectionName: 'components_shared_social_links';
  info: {
    displayName: 'Social Link';
    description: 'Enlace a red social';
    icon: 'share-alt';
  };
  attributes: {
    red: Attribute.Enumeration<
      ['instagram', 'facebook', 'tiktok', 'youtube', 'x', 'linkedin']
    > &
      Attribute.Required;
    url: Attribute.String & Attribute.Required;
    aria_label: Attribute.String;
  };
}

export interface SharedSeo extends Schema.Component {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'SEO';
    description: 'Metadatos SEO para una p\u00E1gina';
    icon: 'search';
  };
  attributes: {
    meta_title: Attribute.String;
    meta_description: Attribute.Text;
    og_image: Attribute.Media<'images'>;
    canonical_url: Attribute.String;
    no_index: Attribute.Boolean & Attribute.DefaultTo<false>;
  };
}

export interface SharedLink extends Schema.Component {
  collectionName: 'components_shared_links';
  info: {
    displayName: 'Link';
    description: 'Enlace gen\u00E9rico (label + href + flags)';
    icon: 'link';
  };
  attributes: {
    label: Attribute.String & Attribute.Required;
    href: Attribute.String & Attribute.Required;
    external: Attribute.Boolean & Attribute.DefaultTo<false>;
    icon: Attribute.String;
  };
}

export interface SharedEyebrowTri extends Schema.Component {
  collectionName: 'components_shared_eyebrow_tris';
  info: {
    displayName: 'Eyebrow Tri';
    description: 'Eyebrow tipo EASE YOUR LIFE \u2014 tres tramos con colores distintos';
    icon: 'text';
  };
  attributes: {
    ease: Attribute.String & Attribute.Required & Attribute.DefaultTo<'EASE'>;
    your: Attribute.String & Attribute.Required & Attribute.DefaultTo<'YOUR'>;
    life: Attribute.String & Attribute.Required & Attribute.DefaultTo<'LIFE'>;
  };
}

export interface ModeloFeature extends Schema.Component {
  collectionName: 'components_modelo_features';
  info: {
    displayName: 'Feature';
    description: 'Item con t\u00EDtulo y descripci\u00F3n \u2014 sirve para galer\u00EDa de caracter\u00EDsticas y sistemas de seguridad';
    icon: 'list-ul';
  };
  attributes: {
    feat: Attribute.String & Attribute.Required;
    desc: Attribute.Text;
    imagen: Attribute.Media<'images'>;
  };
}

export interface ModeloColor extends Schema.Component {
  collectionName: 'components_modelo_colors';
  info: {
    displayName: 'Color';
    description: 'Color disponible para el modelo (exterior o interior)';
    icon: 'palette';
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    hex: Attribute.String & Attribute.Required;
    tipo: Attribute.Enumeration<['Exterior', 'Interior']> &
      Attribute.DefaultTo<'Exterior'>;
    imagen_aerea: Attribute.Media<'images'> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    imagen_lateral: Attribute.Media<'images'> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
  };
}

export interface HomeActionCard extends Schema.Component {
  collectionName: 'components_home_action_cards';
  info: {
    displayName: 'Action Card';
    description: 'Tarjeta de acci\u00F3n para la secci\u00F3n "Qu\u00E9 hacer" (home)';
    icon: 'hand-pointer';
  };
  attributes: {
    label: Attribute.String & Attribute.Required;
    icon: Attribute.Enumeration<['se', 'pin', 'doc', 'wrench', 'car']> &
      Attribute.DefaultTo<'se'>;
    href: Attribute.String & Attribute.Required;
    primary: Attribute.Boolean & Attribute.DefaultTo<false>;
  };
}

export interface FooterColumn extends Schema.Component {
  collectionName: 'components_footer_columns';
  info: {
    displayName: 'Footer Column';
    description: 'Columna del footer con t\u00EDtulo y lista de links';
    icon: 'list';
  };
  attributes: {
    titulo: Attribute.String & Attribute.Required;
    links: Attribute.Component<'shared.link', true>;
  };
}

export interface NavModelLink extends Schema.Component {
  collectionName: 'components_nav_model_links';
  info: {
    displayName: 'Nav Model Link';
    description: 'Item del navbar que apunta a una p\u00E1gina de modelo';
    icon: 'car';
  };
  attributes: {
    label_override: Attribute.String;
    href: Attribute.String & Attribute.Required;
    modelo: Attribute.Relation<
      'nav.model-link',
      'oneToOne',
      'api::modelo.modelo'
    >;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'shared.version': SharedVersion;
      'shared.social-link': SharedSocialLink;
      'shared.seo': SharedSeo;
      'shared.link': SharedLink;
      'shared.eyebrow-tri': SharedEyebrowTri;
      'modelo.feature': ModeloFeature;
      'modelo.color': ModeloColor;
      'home.action-card': HomeActionCard;
      'footer.column': FooterColumn;
      'nav.model-link': NavModelLink;
    }
  }
}
