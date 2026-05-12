import type { Schema, Attribute } from '@strapi/strapi';

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    name: 'Permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    name: 'User';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    username: Attribute.String;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    registrationToken: Attribute.String & Attribute.Private;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    preferedLanguage: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    name: 'Role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    name: 'Api Token';
    singularName: 'api-token';
    pluralName: 'api-tokens';
    displayName: 'Api Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    name: 'API Token Permission';
    description: '';
    singularName: 'api-token-permission';
    pluralName: 'api-token-permissions';
    displayName: 'API Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    name: 'Transfer Token';
    singularName: 'transfer-token';
    pluralName: 'transfer-tokens';
    displayName: 'Transfer Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    name: 'Transfer Token Permission';
    description: '';
    singularName: 'transfer-token-permission';
    pluralName: 'transfer-token-permissions';
    displayName: 'Transfer Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    singularName: 'file';
    pluralName: 'files';
    displayName: 'File';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    alternativeText: Attribute.String;
    caption: Attribute.String;
    width: Attribute.Integer;
    height: Attribute.Integer;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    ext: Attribute.String;
    mime: Attribute.String & Attribute.Required;
    size: Attribute.Decimal & Attribute.Required;
    url: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    singularName: 'folder';
    pluralName: 'folders';
    displayName: 'Folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    singularName: 'release';
    pluralName: 'releases';
    displayName: 'Release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    timezone: Attribute.String;
    status: Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Attribute.Required;
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    singularName: 'release-action';
    pluralName: 'release-actions';
    displayName: 'Release Action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required;
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >;
    contentType: Attribute.String & Attribute.Required;
    locale: Attribute.String;
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >;
    isEntryValid: Attribute.Boolean;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    singularName: 'locale';
    pluralName: 'locales';
    collectionName: 'locales';
    displayName: 'Locale';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          min: 1;
          max: 50;
        },
        number
      >;
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    name: 'permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    name: 'role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    description: Attribute.String;
    type: Attribute.String & Attribute.Unique;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    name: 'user';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  attributes: {
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Attribute.String;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiContactoPageContactoPage extends Schema.SingleType {
  collectionName: 'contacto_pages';
  info: {
    singularName: 'contacto-page';
    pluralName: 'contacto-pages';
    displayName: 'Contacto Page';
    description: 'Configuraci\u00F3n del formulario de contacto y copy de la p\u00E1gina';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    hero_title: Attribute.String & Attribute.DefaultTo<'Contacto'>;
    nav_cotizar_label: Attribute.String & Attribute.DefaultTo<'Cotizar'>;
    nav_cotizar_href: Attribute.String & Attribute.DefaultTo<'cotizador.html'>;
    nav_sucursales_label: Attribute.String & Attribute.DefaultTo<'Sucursales'>;
    nav_sucursales_href: Attribute.String &
      Attribute.DefaultTo<'sucursales.html'>;
    tipos_solicitud: Attribute.JSON;
    areas: Attribute.JSON;
    modelos_form: Attribute.JSON;
    privacidad_label_html: Attribute.RichText;
    mensaje_exito_titulo: Attribute.String &
      Attribute.DefaultTo<'\u00A1Gracias por contactarnos!'>;
    mensaje_exito_texto: Attribute.Text;
    mensaje_exito_cta_label: Attribute.String &
      Attribute.DefaultTo<'Enviar otra consulta'>;
    footer_image: Attribute.Media<'images'>;
    seo: Attribute.Component<'shared.seo'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::contacto-page.contacto-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::contacto-page.contacto-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCotizadorPageCotizadorPage extends Schema.SingleType {
  collectionName: 'cotizador_pages';
  info: {
    singularName: 'cotizador-page';
    pluralName: 'cotizador-pages';
    displayName: 'Cotizador Page';
    description: 'Copy y configuraci\u00F3n del cotizador independiente';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    hero_title: Attribute.String & Attribute.DefaultTo<'Cotizador'>;
    intro_eyebrow: Attribute.String & Attribute.DefaultTo<'Solicita'>;
    intro_title: Attribute.String & Attribute.DefaultTo<'Cotiza tu SOUEAST'>;
    intro_lead: Attribute.Text &
      Attribute.DefaultTo<'Te contactaremos en menos de 24 horas con una propuesta personalizada y la sucursal m\u00E1s cercana.'>;
    form_subtitle: Attribute.Text &
      Attribute.DefaultTo<'Completa el formulario y nos pondremos en contacto contigo'>;
    form_fields: Attribute.JSON;
    form_messages: Attribute.JSON;
    modelos_form: Attribute.JSON;
    versiones_form: Attribute.JSON;
    submit_label: Attribute.String &
      Attribute.DefaultTo<'SOLICITAR COTIZACI\u00D3N'>;
    submitting_label: Attribute.String & Attribute.DefaultTo<'ENVIANDO\u2026'>;
    mensaje_exito: Attribute.RichText;
    mensaje_error: Attribute.RichText;
    privacidad_label_html: Attribute.RichText;
    seo: Attribute.Component<'shared.seo'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::cotizador-page.cotizador-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::cotizador-page.cotizador-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiFooterFooter extends Schema.SingleType {
  collectionName: 'footers';
  info: {
    singularName: 'footer';
    pluralName: 'footers';
    displayName: 'Footer';
    description: 'Configuraci\u00F3n del footer global';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    copyright: Attribute.String;
    legales: Attribute.RichText;
    columnas: Attribute.JSON;
    tagline_eyebrow: Attribute.Component<'shared.eyebrow-tri'>;
    back_to_top_label: Attribute.String & Attribute.DefaultTo<'VOLVER ARRIBA'>;
    modelos_titulo: Attribute.String & Attribute.DefaultTo<'Modelos'>;
    modelos_links: Attribute.Component<'shared.link', true>;
    secondary_titulo: Attribute.String & Attribute.DefaultTo<'M\u00E1s'>;
    secondary_links: Attribute.Component<'shared.link', true>;
    social_titulo: Attribute.String & Attribute.DefaultTo<'S\u00EDguenos'>;
    social: Attribute.Component<'shared.social-link', true>;
    columnas_tipadas: Attribute.Component<'footer.column', true>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::footer.footer',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::footer.footer',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiGlobalGlobal extends Schema.SingleType {
  collectionName: 'globals';
  info: {
    singularName: 'global';
    pluralName: 'globals';
    displayName: 'Global';
    description: 'Configuraci\u00F3n global del sitio (navbar, whatsapp, claves, defaults SEO)';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    brand_name: Attribute.String & Attribute.DefaultTo<'SOUEAST Chile'>;
    brand_logo: Attribute.Media<'images'>;
    tagline_eyebrow: Attribute.Component<'shared.eyebrow-tri'>;
    nav_models: Attribute.Component<'nav.model-link', true>;
    nav_cotizar_label: Attribute.String & Attribute.DefaultTo<'Cotizar'>;
    nav_sucursales_label: Attribute.String & Attribute.DefaultTo<'Sucursales'>;
    nav_noticias_label: Attribute.String & Attribute.DefaultTo<'Noticias'>;
    nav_noticias_href: Attribute.String & Attribute.DefaultTo<'noticias.html'>;
    nav_service_label: Attribute.String &
      Attribute.DefaultTo<'Agenda tu servicio'>;
    nav_service_href: Attribute.String & Attribute.DefaultTo<'#servicio'>;
    nav_cta_external_url: Attribute.String;
    whatsapp_phone: Attribute.String;
    whatsapp_brand_name: Attribute.String & Attribute.DefaultTo<'Andes Retail'>;
    whatsapp_subtitle: Attribute.Text;
    whatsapp_bubble_text: Attribute.Text;
    whatsapp_button_label: Attribute.String &
      Attribute.DefaultTo<'\u00A1Hablemos!'>;
    whatsapp_credit_html: Attribute.RichText;
    bloomreach_token: Attribute.String;
    bloomreach_target: Attribute.String &
      Attribute.DefaultTo<'https://api.us1.exponea.com'>;
    google_maps_api_key: Attribute.String;
    default_cotizar_modelo: Attribute.String & Attribute.DefaultTo<'S06'>;
    default_seo: Attribute.Component<'shared.seo'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::global.global',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::global.global',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiGraciasPageGraciasPage extends Schema.SingleType {
  collectionName: 'gracias_pages';
  info: {
    singularName: 'gracias-page';
    pluralName: 'gracias-pages';
    displayName: 'Gracias Page';
    description: 'Copy de la p\u00E1gina post-submit';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    title: Attribute.String & Attribute.DefaultTo<'\u00A1Gracias!'>;
    mensaje: Attribute.RichText;
    imagen: Attribute.Media<'images'>;
    cta_label: Attribute.String & Attribute.DefaultTo<'Volver al inicio'>;
    cta_href: Attribute.String & Attribute.DefaultTo<'home.html'>;
    seo: Attribute.Component<'shared.seo'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::gracias-page.gracias-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::gracias-page.gracias-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiHomePageHomePage extends Schema.SingleType {
  collectionName: 'home_pages';
  info: {
    singularName: 'home-page';
    pluralName: 'home-pages';
    displayName: 'Home Page';
    description: 'Contenido editorial de la home';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    hero_eyebrow: Attribute.Component<'shared.eyebrow-tri'>;
    hero_title: Attribute.String &
      Attribute.DefaultTo<'Bienvenidos a SOUEAST Chile'>;
    hero_cta_label: Attribute.String & Attribute.DefaultTo<'CONOCE M\u00C1S'>;
    hero_cta_href: Attribute.String & Attribute.DefaultTo<'modelo-s06.html'>;
    hero_video_pc: Attribute.Media<'videos'>;
    hero_video_mobile: Attribute.Media<'videos'>;
    hero_video_poster: Attribute.Media<'images'>;
    modelos_section_title: Attribute.String & Attribute.DefaultTo<'Modelos'>;
    modelos_destacados: Attribute.Relation<
      'api::home-page.home-page',
      'oneToMany',
      'api::modelo.modelo'
    >;
    modelos_default_tag: Attribute.String & Attribute.DefaultTo<'Lanzamiento'>;
    noticias_section_title: Attribute.String & Attribute.DefaultTo<'Noticias'>;
    noticias_ver_todas_label: Attribute.String &
      Attribute.DefaultTo<'VER TODAS'>;
    quehacer_items: Attribute.Component<'home.action-card', true>;
    seo: Attribute.Component<'shared.seo'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::home-page.home-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::home-page.home-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiLegalPageLegalPage extends Schema.CollectionType {
  collectionName: 'legal_pages';
  info: {
    singularName: 'legal-page';
    pluralName: 'legal-pages';
    displayName: 'Legal Page';
    description: 'P\u00E1ginas legales (pol\u00EDticas, legales, simulaciones) editables desde el CMS';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    slug: Attribute.UID<'api::legal-page.legal-page', 'titulo'> &
      Attribute.Required;
    titulo: Attribute.String & Attribute.Required;
    bajada: Attribute.Text;
    contenido: Attribute.RichText;
    simulaciones: Attribute.Component<'legal.financing-sim', true>;
    fecha_vigencia: Attribute.Date;
    seo: Attribute.Component<'shared.seo'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::legal-page.legal-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::legal-page.legal-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiModeloModelo extends Schema.CollectionType {
  collectionName: 'modelos';
  info: {
    singularName: 'modelo';
    pluralName: 'modelos';
    displayName: 'Modelo';
    description: 'Modelos de veh\u00EDculos SOUEAST';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    slug: Attribute.UID<'api::modelo.modelo', 'nombre'> & Attribute.Required;
    nombre: Attribute.String & Attribute.Required;
    tagline: Attribute.String;
    descripcion: Attribute.Text;
    precio_desde: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    precio_legal: Attribute.Text;
    destacado: Attribute.Boolean & Attribute.DefaultTo<false>;
    categoria: Attribute.Enumeration<
      ['SUV', 'Sed\u00E1n', 'Pick Up', 'H\u00EDbrido']
    > &
      Attribute.DefaultTo<'SUV'>;
    orden: Attribute.Integer & Attribute.DefaultTo<0>;
    imagen_principal: Attribute.Media<'images'>;
    imagen_lateral: Attribute.Media<'images'>;
    versiones: Attribute.Component<'shared.version', true>;
    galeria: Attribute.Component<'modelo.feature', true>;
    colores: Attribute.Component<'modelo.color', true>;
    seguridad: Attribute.Component<'modelo.feature', true>;
    nav_label: Attribute.String;
    descripcion_lead: Attribute.Text;
    hero_cta_primary_label: Attribute.String;
    hero_cta_primary_href: Attribute.String;
    hero_cta_secondary_label: Attribute.String;
    hero_cta_secondary_href: Attribute.String;
    news_imagen_lateral: Attribute.Media<'images'>;
    news_tag: Attribute.String;
    page_url: Attribute.String;
    seo: Attribute.Component<'shared.seo'>;
    specs_disclaimer: Attribute.Text;
    specs: Attribute.JSON;
    cotizar_privacidad_html: Attribute.RichText;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::modelo.modelo',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::modelo.modelo',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiNoticiaNoticia extends Schema.CollectionType {
  collectionName: 'noticias';
  info: {
    singularName: 'noticia';
    pluralName: 'noticias';
    displayName: 'Noticia';
    description: 'Art\u00EDculos, eventos y novedades';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    slug: Attribute.UID<'api::noticia.noticia', 'titulo'> & Attribute.Required;
    titulo: Attribute.String & Attribute.Required;
    categoria: Attribute.Enumeration<
      ['Marca', 'Modelos', 'Lanzamientos', 'Tecnologia']
    > &
      Attribute.DefaultTo<'Marca'>;
    fecha: Attribute.Date;
    fecha_label: Attribute.String;
    tag: Attribute.String;
    tag_variant: Attribute.Enumeration<['red', 'white', 'blue', 'green']> &
      Attribute.DefaultTo<'red'>;
    imagen: Attribute.Media<'images'>;
    destacado_home: Attribute.Boolean & Attribute.DefaultTo<false>;
    orden_home: Attribute.Integer;
    resumen: Attribute.Text;
    contenido: Attribute.RichText;
    cta_label: Attribute.String;
    cta_href: Attribute.String;
    seo: Attribute.Component<'shared.seo'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::noticia.noticia',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::noticia.noticia',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiNoticiasPageNoticiasPage extends Schema.SingleType {
  collectionName: 'noticias_pages';
  info: {
    singularName: 'noticias-page';
    pluralName: 'noticias-pages';
    displayName: 'Noticias Page';
    description: 'Configuraci\u00F3n de la p\u00E1gina de listado de noticias';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    hero_eyebrow_label: Attribute.String &
      Attribute.DefaultTo<'\u00DAltimas noticias'>;
    hero_title: Attribute.String & Attribute.DefaultTo<'Noticias'>;
    categorias: Attribute.JSON;
    empty_state_text: Attribute.Text &
      Attribute.DefaultTo<'No hay noticias en esta categor\u00EDa por el momento.'>;
    seo: Attribute.Component<'shared.seo'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::noticias-page.noticias-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::noticias-page.noticias-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiSucursalSucursal extends Schema.CollectionType {
  collectionName: 'sucursales';
  info: {
    singularName: 'sucursal';
    pluralName: 'sucursales';
    displayName: 'Sucursal';
    description: 'Red de sucursales SOUEAST Chile';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    nombre: Attribute.String & Attribute.Required;
    direccion: Attribute.String & Attribute.Required;
    comuna: Attribute.String & Attribute.Required;
    region: Attribute.String & Attribute.Required;
    lat: Attribute.Decimal & Attribute.Required;
    lng: Attribute.Decimal & Attribute.Required;
    horario: Attribute.String;
    tipo_label: Attribute.Enumeration<
      ['Sala de ventas', 'Showroom Exclusivo', 'Servicio T\u00E9cnico']
    > &
      Attribute.DefaultTo<'Sala de ventas'>;
    servicios: Attribute.JSON;
    slug: Attribute.UID<'api::sucursal.sucursal', 'nombre'>;
    telefono: Attribute.String;
    email: Attribute.Email;
    imagen_portada: Attribute.Media<'images'>;
    orden: Attribute.Integer & Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::sucursal.sucursal',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::sucursal.sucursal',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTestDrivePageTestDrivePage extends Schema.SingleType {
  collectionName: 'test_drive_pages';
  info: {
    singularName: 'test-drive-page';
    pluralName: 'test-drive-pages';
    displayName: 'Test Drive Page';
    description: 'Copy y textos del formulario Test Drive';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    hero_eyebrow: Attribute.String & Attribute.DefaultTo<'Agenda'>;
    hero_title: Attribute.String & Attribute.DefaultTo<'Agenda tu Test Drive'>;
    hero_lead: Attribute.Text;
    modelos_form: Attribute.JSON;
    submit_label: Attribute.String & Attribute.DefaultTo<'AGENDAR TEST DRIVE'>;
    privacidad_html: Attribute.RichText;
    success_title: Attribute.String & Attribute.DefaultTo<'\u00A1Listo!'>;
    success_lead: Attribute.Text;
    success_cta_label: Attribute.String & Attribute.DefaultTo<'VOLVER AL HOME'>;
    success_cta_href: Attribute.String & Attribute.DefaultTo<'home.html'>;
    nota_legal: Attribute.Text;
    seo: Attribute.Component<'shared.seo'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::test-drive-page.test-drive-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::test-drive-page.test-drive-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::permission': AdminPermission;
      'admin::user': AdminUser;
      'admin::role': AdminRole;
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
      'api::contacto-page.contacto-page': ApiContactoPageContactoPage;
      'api::cotizador-page.cotizador-page': ApiCotizadorPageCotizadorPage;
      'api::footer.footer': ApiFooterFooter;
      'api::global.global': ApiGlobalGlobal;
      'api::gracias-page.gracias-page': ApiGraciasPageGraciasPage;
      'api::home-page.home-page': ApiHomePageHomePage;
      'api::legal-page.legal-page': ApiLegalPageLegalPage;
      'api::modelo.modelo': ApiModeloModelo;
      'api::noticia.noticia': ApiNoticiaNoticia;
      'api::noticias-page.noticias-page': ApiNoticiasPageNoticiasPage;
      'api::sucursal.sucursal': ApiSucursalSucursal;
      'api::test-drive-page.test-drive-page': ApiTestDrivePageTestDrivePage;
    }
  }
}
