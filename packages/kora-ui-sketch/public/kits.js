// Generic screen kits shared by every project (e.g. authentication).
// Placeholders, resolved when a kit is added to a project:
//   "$app"            → project name (doc.app) inside any text
//   to: "$home"       → first screen of the app outside the kit

const t = (type, props = {}, children) => (children ? { type, ...props, children } : { type, ...props });
const btn = (label, to, variant = 'secondary') => t('button', { label, to, variant });
const link = (label, to) => btn(label, to, 'ghost');
const text = (s) => t('text', { text: s });

// Split layout: brand panel left, form right.
const auth = (title, subtitle, form) => t('row', { gap: 0 }, [
  t('col', { flex: 1, gap: 16 }, [t('image', { label: '$app · imagen de marca', height: 760 })]),
  t('col', { flex: 1, gap: 16 }, [
    t('spacer', { size: 96 }),
    t('row', { gap: 0, align: 'center' }, [t('col', { flex: 1 }, []), t('col', { flex: 3, gap: 16 }, [
      t('row', { gap: 8, align: 'center' }, [t('icon', { label: 'Logo' }), t('heading', { text: '$app', level: 3 })]),
      t('heading', { text: title, level: 1 }),
      subtitle && text(subtitle),
      ...form,
    ].filter(Boolean)), t('col', { flex: 1 }, [])]),
  ]),
]);
// Centered message page (errors, states).
const message = (icon, title, body, actions) => t('col', { gap: 16 }, [
  t('spacer', { size: 160 }),
  t('row', { align: 'center' }, [t('col', { flex: 1 }, []), t('col', { flex: 2, gap: 16 }, [
    t('icon', { label: icon }), t('heading', { text: title, level: 1 }), text(body), t('row', { gap: 8 }, actions),
  ]), t('col', { flex: 1 }, [])]),
]);
const S = (name, root) => ({ name, section: 'Acceso', root });

export default [
  {
    section: 'Acceso',
    description: 'Login, registro, recuperar contraseña, 2FA, errores 403/404',
    screens: [
      S('Iniciar sesión', auth('Iniciar sesión', 'Ingresa con tu usuario individual', [
        t('input', { label: 'Correo o usuario', placeholder: 'usuario@empresa.com' }),
        t('input', { label: 'Contraseña', placeholder: '••••••••' }),
        t('row', { align: 'between' }, [t('checkbox', { label: 'Recordarme' }), link('¿Olvidaste tu contraseña?', 'Recuperar contraseña')]),
        btn('Entrar', '$home', 'primary'),
        t('row', { gap: 4, align: 'center' }, [text('¿No tienes cuenta?'), link('Crear cuenta', 'Registro')]),
        t('alert', { text: 'Usuario o contraseña incorrectos. Te quedan 2 intentos.', tone: 'danger', to: 'Cuenta bloqueada' }),
      ])),
      S('Recuperar contraseña', auth('Recuperar contraseña', 'Te enviaremos un enlace para crear una nueva contraseña.', [
        t('input', { label: 'Correo', placeholder: 'usuario@empresa.com' }),
        btn('Enviar enlace', 'Revisa tu correo', 'primary'),
        link('← Volver a iniciar sesión', 'Iniciar sesión'),
      ])),
      S('Revisa tu correo', auth('Revisa tu correo', 'Enviamos un enlace a usuario@empresa.com. Vence en 30 minutos.', [
        btn('Abrir el enlace (demo)', 'Nueva contraseña', 'primary'),
        t('row', { gap: 4, align: 'center' }, [text('¿No llegó?'), link('Reenviar', 'Revisa tu correo')]),
        link('← Volver a iniciar sesión', 'Iniciar sesión'),
      ])),
      S('Nueva contraseña', auth('Crea una nueva contraseña', null, [
        t('input', { label: 'Nueva contraseña', placeholder: '••••••••' }),
        t('input', { label: 'Confirmar contraseña', placeholder: '••••••••' }),
        t('list', { items: ['Mínimo 10 caracteres', 'Una mayúscula y un número', 'Diferente a las anteriores'] }),
        btn('Guardar contraseña', 'Contraseña actualizada', 'primary'),
      ])),
      S('Contraseña actualizada', message('✓', 'Contraseña actualizada', 'Ya puedes iniciar sesión con tu nueva contraseña.', [btn('Ir a iniciar sesión', 'Iniciar sesión', 'primary')])),
      S('Registro', auth('Crear cuenta', 'Completa tus datos para solicitar acceso.', [
        t('grid', { cols: 2 }, [t('input', { label: 'Nombre' }), t('input', { label: 'Apellido' })]),
        t('input', { label: 'Correo' }), t('input', { label: 'Teléfono' }),
        t('grid', { cols: 2 }, [t('input', { label: 'Contraseña' }), t('input', { label: 'Confirmar contraseña' })]),
        t('checkbox', { label: 'Acepto los términos y la política de privacidad' }),
        btn('Crear cuenta', 'Verificar correo', 'primary'),
        t('row', { gap: 4, align: 'center' }, [text('¿Ya tienes cuenta?'), link('Iniciar sesión', 'Iniciar sesión')]),
      ])),
      S('Verificar correo', auth('Verifica tu correo', 'Ingresa el código de 6 dígitos que enviamos a tu correo.', [
        t('grid', { cols: 6 }, Array.from({ length: 6 }, () => t('input', { label: '' }))),
        btn('Verificar', '$home', 'primary'),
        t('row', { gap: 4, align: 'center' }, [text('¿No llegó?'), link('Reenviar código', 'Verificar correo')]),
      ])),
      S('Verificación en dos pasos', auth('Verificación en dos pasos', 'Abre tu app de autenticación e ingresa el código.', [
        t('grid', { cols: 6 }, Array.from({ length: 6 }, () => t('input', { label: '' }))),
        t('checkbox', { label: 'Confiar en este dispositivo por 30 días' }),
        btn('Verificar', '$home', 'primary'),
        link('Usar un código de respaldo', 'Verificación en dos pasos'),
      ])),
      S('Primer ingreso', auth('Bienvenido a $app', 'Tu cuenta fue creada por un administrador. Cambia tu contraseña temporal para continuar.', [
        t('input', { label: 'Contraseña temporal' }),
        t('input', { label: 'Nueva contraseña' }),
        t('input', { label: 'Confirmar contraseña' }),
        t('toggle', { label: 'Activar verificación en dos pasos' }),
        btn('Guardar y entrar', '$home', 'primary'),
      ])),
      S('Sesión expirada', message('⏱', 'Tu sesión expiró', 'Por seguridad cerramos tu sesión después de 30 minutos sin actividad.', [btn('Volver a iniciar sesión', 'Iniciar sesión', 'primary')])),
      S('Cuenta bloqueada', message('🔒', 'Cuenta bloqueada temporalmente', 'Hubo demasiados intentos fallidos. Espera 15 minutos o recupera tu contraseña.', [btn('Recuperar contraseña', 'Recuperar contraseña', 'primary'), link('Contactar al administrador', 'Iniciar sesión')])),
      S('Sin permisos', message('403', 'No tienes acceso a esta sección', 'Tu cargo no tiene permiso para ver esta página. Si crees que es un error, solicita acceso al administrador.', [btn('Ir al inicio', '$home', 'primary'), btn('Solicitar acceso', '$home')])),
      S('Página no encontrada', message('404', 'Página no encontrada', 'La página que buscas no existe o fue movida.', [btn('Ir al inicio', '$home', 'primary')])),
    ],
  },
];
