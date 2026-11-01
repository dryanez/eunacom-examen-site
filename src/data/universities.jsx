import React, { useState } from 'react'

// ─── UNIVERSIDADES CHILENAS Y SUS LOGOS / SEDES ─────────────────────────────
export const CHILEAN_UNIVERSITIES = [
  {
    id: 'uchile',
    name: 'Universidad de Chile (UCH)',
    shortName: 'UCH',
    logo: '/img/unis_clean/uchile.png',
    sedes: ['Santiago (Norte / Independencia)', 'Santiago (Centro)', 'Santiago (Oriente / Salvador)', 'Santiago (Sur / San Borja)', 'Santiago (Occidente / San Juan)'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'uc',
    name: 'Pontificia Universidad Católica de Chile (PUC)',
    shortName: 'PUC',
    logo: '/img/unis_clean/uc.png',
    sedes: ['Santiago (Casa Central)', 'Santiago (San Joaquín)', 'Santiago (Marcoleta)'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'udec',
    name: 'Universidad de Concepción (UdeC)',
    shortName: 'UdeC',
    logo: '/img/unis_clean/udec.png',
    sedes: ['Concepción', 'Chillán', 'Los Ángeles'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'uv',
    name: 'Universidad de Valparaíso (UV)',
    shortName: 'UV',
    logo: '/img/unis_clean/uv.png',
    sedes: ['Valparaíso / Viña del Mar', 'San Felipe'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'usach',
    name: 'Universidad de Santiago de Chile (USACH)',
    shortName: 'USACH',
    logo: '/img/unis_clean/usach.png',
    sedes: ['Santiago (Estación Central)'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'uandes',
    name: 'Universidad de los Andes (UANDES)',
    shortName: 'UANDES',
    logo: '/img/unis_clean/uandes.png',
    sedes: ['Santiago (San Carlos de Apoquindo)'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'udd',
    name: 'Universidad del Desarrollo (UDD)',
    shortName: 'UDD',
    logo: '/img/unis_clean/udd.png',
    sedes: ['Santiago (Las Condes / La Florida)', 'Concepción'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'uaustral',
    name: 'Universidad Austral de Chile (UACh)',
    shortName: 'UACh',
    logo: '/img/unis_clean/uaustral.png',
    sedes: ['Valdivia', 'Osorno', 'Puerto Montt'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'ufro',
    name: 'Universidad de La Frontera (UFRO)',
    shortName: 'UFRO',
    logo: '/img/unis_clean/ufro.png',
    sedes: ['Temuco'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'ucn',
    name: 'Universidad Católica del Norte (UCN)',
    shortName: 'UCN',
    logo: '/img/unis_clean/ucn.png',
    sedes: ['Coquimbo', 'Antofagasta'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'umayor',
    name: 'Universidad Mayor',
    shortName: 'UMayor',
    logo: '/img/unis_clean/umayor.png',
    sedes: ['Santiago (Huechuraba / Providencia)', 'Temuco'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'uss',
    name: 'Universidad San Sebastián (USS)',
    shortName: 'USS',
    logo: '/img/unis_clean/uss.png',
    sedes: ['Santiago (Bellavista / Los Leones)', 'Concepción (Tres Pascualas)', 'Valdivia', 'Puerto Montt (Patagonia)'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'uft',
    name: 'Universidad Finis Terrae',
    shortName: 'UFT',
    logo: '/img/unis_clean/uft.png',
    sedes: ['Santiago (Providencia)'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'unab',
    name: 'Universidad Andrés Bello (UNAB)',
    shortName: 'UNAB',
    logo: '/img/unis_clean/unab.png',
    sedes: ['Santiago (Casona / República)', 'Viña del Mar', 'Concepción'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'udp',
    name: 'Universidad Diego Portales (UDP)',
    shortName: 'UDP',
    logo: '/img/unis_clean/udp.png',
    sedes: ['Santiago (Centro / Manuel Rodríguez)'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'uantofa',
    name: 'Universidad de Antofagasta',
    shortName: 'UAntofagasta',
    logo: '/img/unis_clean/uantofa.png',
    sedes: ['Antofagasta (Campus Coloso)'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'utalca',
    name: 'Universidad de Talca',
    shortName: 'UTalca',
    logo: '/img/unis_clean/utalca.png',
    sedes: ['Talca (Campus Lircay)', 'Curicó'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'ucm',
    name: 'Universidad Católica del Maule (UCM)',
    shortName: 'UCM',
    logo: '/img/unis_clean/ucm.png',
    sedes: ['Talca (Campus San Miguel)', 'Curicó'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'uta',
    name: 'Universidad de Tarapacá',
    shortName: 'UTA',
    logo: '/img/unis_clean/uta.png',
    sedes: ['Arica (Campus Saucache)', 'Iquique'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'uoh',
    name: 'Universidad de O\'Higgins (UOH)',
    shortName: 'UOH',
    logo: '/img/unis_clean/uoh.png',
    sedes: ['Rancagua (Campus Rancagua)'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'umag',
    name: 'Universidad de Magallanes (UMAG)',
    shortName: 'UMAG',
    logo: '/img/unis_clean/umag.png',
    sedes: ['Punta Arenas'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'uatacama',
    name: 'Universidad de Atacama (UDA)',
    shortName: 'UDA',
    logo: '/img/unis_clean/uatacama.png',
    sedes: ['Copiapó'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'uboh',
    name: 'Universidad Bernardo O\'Higgins (UBO)',
    shortName: 'UBO',
    logo: '/img/unis_clean/uboh.png',
    sedes: ['Santiago (Rondizzoni / Viel)'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'uautonoma',
    name: 'Universidad Autónoma de Chile',
    shortName: 'UAutónoma',
    logo: '/img/unis_clean/uautonoma.png',
    sedes: ['Santiago (Providencia / El Llano)', 'Talca', 'Temuco'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'ucentral',
    name: 'Universidad Central de Chile',
    shortName: 'UCentral',
    logo: '/img/unis_clean/ucentral.png',
    sedes: ['Santiago (Toesca / Gonzalo Rojas)', 'Coquimbo'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'ucsc',
    name: 'Universidad Católica de la Santísima Concepción',
    shortName: 'UCSC',
    logo: '/img/unis_clean/ucsc.png',
    sedes: ['Concepción (San Andrés)'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'pucv',
    name: 'Pontificia Universidad Católica de Valparaíso (PUCV)',
    shortName: 'PUCV',
    logo: '/img/unis_clean/pucv.png',
    sedes: ['Valparaíso', 'Viña del Mar'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  },
  {
    id: 'delalba',
    name: 'Universidad del Alba',
    shortName: 'UAlba',
    logo: null,
    sedes: ['Santiago', 'La Serena', 'Antofagasta', 'Chillán'],
    country: 'Chile',
    countryCode: 'CL',
    flag: '🇨🇱'
  }
]

// ─── LISTA DE PAÍSES CON BANDERAS ──────────────────────────────────────────
export const COUNTRIES = [
  { name: 'Chile', code: 'CL', flag: '🇨🇱', dial: '+56' },
  { name: 'Venezuela', code: 'VE', flag: '🇻🇪', dial: '+58' },
  { name: 'Colombia', code: 'CO', flag: '🇨🇴', dial: '+57' },
  { name: 'Perú', code: 'PE', flag: '🇵🇪', dial: '+51' },
  { name: 'Ecuador', code: 'EC', flag: '🇪🇨', dial: '+593' },
  { name: 'Argentina', code: 'AR', flag: '🇦🇷', dial: '+54' },
  { name: 'Bolivia', code: 'BO', flag: '🇧🇴', dial: '+591' },
  { name: 'Cuba', code: 'CU', flag: '🇨🇺', dial: '+53' },
  { name: 'México', code: 'MX', flag: '🇲🇽', dial: '+52' },
  { name: 'España', code: 'ES', flag: '🇪🇸', dial: '+34' },
  { name: 'Estados Unidos', code: 'US', flag: '🇺🇸', dial: '+1' },
  { name: 'Brasil', code: 'BR', flag: '🇧🇷', dial: '+55' },
  { name: 'República Dominicana', code: 'DO', flag: '🇩🇴', dial: '+1809' },
  { name: 'Uruguay', code: 'UY', flag: '🇺🇾', dial: '+598' },
  { name: 'Paraguay', code: 'PY', flag: '🇵🇾', dial: '+595' },
  { name: 'Panamá', code: 'PA', flag: '🇵🇦', dial: '+507' },
  { name: 'Costa Rica', code: 'CR', flag: '🇨🇷', dial: '+506' },
  { name: 'Guatemala', code: 'GT', flag: '🇬🇹', dial: '+502' },
  { name: 'Honduras', code: 'HN', flag: '🇭🇳', dial: '+504' },
  { name: 'El Salvador', code: 'SV', flag: '🇸🇻', dial: '+503' },
  { name: 'Nicaragua', code: 'NI', flag: '🇳🇮', dial: '+505' },
  { name: 'Puerto Rico', code: 'PR', flag: '🇵🇷', dial: '+1787' },
  { name: 'Otro', code: 'OTHER', flag: '🌐', dial: '+' }
]

// ─── MATCHING HELPERS ───────────────────────────────────────────────────────

export function getCountryInfo(countryNameOrCode) {
  if (!countryNameOrCode) return { name: 'Chile', code: 'CL', flag: '🇨🇱' }
  const clean = String(countryNameOrCode).trim().toLowerCase()
  
  const found = COUNTRIES.find(c => 
    c.name.toLowerCase() === clean || 
    c.code.toLowerCase() === clean ||
    clean.includes(c.name.toLowerCase())
  )
  if (found) return found

  // Common aliases
  if (clean.includes('venez') || clean === 've') return COUNTRIES[1]
  if (clean.includes('colomb') || clean === 'co') return COUNTRIES[2]
  if (clean.includes('peru') || clean.includes('perú') || clean === 'pe') return COUNTRIES[3]
  if (clean.includes('ecuad') || clean === 'ec') return COUNTRIES[4]
  if (clean.includes('argent') || clean === 'ar') return COUNTRIES[5]
  if (clean.includes('boliv') || clean === 'bo') return COUNTRIES[6]
  if (clean.includes('cuba') || clean === 'cu') return COUNTRIES[7]
  if (clean.includes('mexic') || clean.includes('méxic') || clean === 'mx') return COUNTRIES[8]
  if (clean.includes('españ') || clean.includes('espan') || clean === 'es') return COUNTRIES[9]
  if (clean.includes('estados unidos') || clean.includes('eeuu') || clean.includes('usa') || clean === 'us') return COUNTRIES[10]

  return { name: countryNameOrCode, code: 'OTHER', flag: '🌐' }
}

export function getUniversityInfo(universityName) {
  if (!universityName) return null
  const clean = String(universityName).trim().toLowerCase()

  // Match by exact or partial string matching against CHILEAN_UNIVERSITIES
  for (const uni of CHILEAN_UNIVERSITIES) {
    if (uni.name.toLowerCase() === clean || uni.id === clean || uni.shortName.toLowerCase() === clean) {
      return uni
    }
  }

  // Keywords heuristics
  if (clean.includes('católica de chile') || clean.includes('(puc)') || clean.includes('puc') || (clean.includes('catolica') && clean.includes('chile'))) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'uc')
  }
  if (clean.includes('universidad de chile') || clean.includes('(uch)') || clean === 'uch' || clean.includes('u. de chile')) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'uchile')
  }
  if (clean.includes('concepción') || clean.includes('concepcion') || clean.includes('(udec)') || clean === 'udec') {
    if (clean.includes('santísima') || clean.includes('santisima') || clean.includes('ucsc')) {
      return CHILEAN_UNIVERSITIES.find(u => u.id === 'ucsc')
    }
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'udec')
  }
  if (clean.includes('valparaíso') || clean.includes('valparaiso') || clean.includes('(uv)') || clean === 'uv') {
    if (clean.includes('católica') || clean.includes('catolica') || clean.includes('pucv')) {
      return CHILEAN_UNIVERSITIES.find(u => u.id === 'pucv')
    }
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'uv')
  }
  if (clean.includes('santiago de chile') || clean.includes('(usach)') || clean === 'usach') {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'usach')
  }
  if (clean.includes('de los andes') || clean.includes('uandes') || clean === 'uandes') {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'uandes')
  }
  if (clean.includes('del desarrollo') || clean.includes('(udd)') || clean === 'udd') {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'udd')
  }
  if (clean.includes('austral') || clean.includes('uach')) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'uaustral')
  }
  if (clean.includes('la frontera') || clean.includes('ufro')) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'ufro')
  }
  if (clean.includes('católica del norte') || clean.includes('catolica del norte') || clean.includes('ucn')) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'ucn')
  }
  if (clean.includes('mayor') && (clean.includes('universidad') || clean.includes('umayor'))) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'umayor')
  }
  if (clean.includes('san sebastián') || clean.includes('san sebastian') || clean.includes('uss')) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'uss')
  }
  if (clean.includes('finis') || clean.includes('uft')) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'uft')
  }
  if (clean.includes('andrés bello') || clean.includes('andres bello') || clean.includes('unab')) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'unab')
  }
  if (clean.includes('portales') || clean.includes('udp')) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'udp')
  }
  if (clean.includes('antofagasta') && !clean.includes('ucn')) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'uantofa')
  }
  if (clean.includes('talca') && !clean.includes('maule')) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'utalca')
  }
  if (clean.includes('maule') || clean.includes('ucm')) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'ucm')
  }
  if (clean.includes('tarapacá') || clean.includes('tarapaca') || clean.includes('uta')) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'uta')
  }
  if (clean.includes('o\'higgins') || clean.includes('ohiggins') || clean.includes('uoh')) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'uoh')
  }
  if (clean.includes('magallanes') || clean.includes('umag')) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'umag')
  }
  if (clean.includes('atacama') || clean.includes('uda')) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'uatacama')
  }
  if (clean.includes('bernardo') || clean.includes('uboh') || clean.includes('ubo')) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'uboh')
  }
  if (clean.includes('autónoma') || clean.includes('autonoma')) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'uautonoma')
  }
  if (clean.includes('central')) {
    return CHILEAN_UNIVERSITIES.find(u => u.id === 'ucentral')
  }

  return null
}

export function getSedesForUniversity(uniName) {
  const info = getUniversityInfo(uniName)
  if (info && info.sedes && info.sedes.length > 0) {
    return info.sedes
  }
  return ['Sede Principal / Central']
}

/**
 * Returns comprehensive badge metadata for a user profile:
 * {
 *   hasLogo: boolean,
 *   logoUrl: string | null,
 *   flag: string,
 *   primaryLabel: string,
 *   subLabel: string,
 *   countryName: string,
 *   sede: string
 * }
 */
export function getUserInstitutionBadge(user) {
  if (!user) {
    return {
      hasLogo: false,
      logoUrl: null,
      flag: '🇨🇱',
      primaryLabel: 'Médico EUNACOM',
      subLabel: 'Chile',
      countryName: 'Chile',
      sede: 'Chile'
    }
  }

  const rawUni = user.university || ''
  const rawCountry = user.country || user.nationality || (rawUni.includes(' - ') ? rawUni.split(' - ')[0] : 'Chile')
  const rawSede = user.sede || ''

  const uniInfo = getUniversityInfo(rawUni)
  const countryInfo = getCountryInfo(rawCountry)

  if (uniInfo && uniInfo.logo) {
    return {
      hasLogo: true,
      logoUrl: uniInfo.logo,
      flag: uniInfo.flag || '🇨🇱',
      primaryLabel: uniInfo.shortName || uniInfo.name,
      fullName: uniInfo.name,
      subLabel: rawSede || uniInfo.sedes?.[0] || 'Chile',
      countryName: uniInfo.country || 'Chile',
      sede: rawSede || uniInfo.sedes?.[0] || 'Sede Principal'
    }
  }

  // Fallback to Country Flag
  let customUniName = rawUni
  if (rawUni.includes(' - ')) {
    customUniName = rawUni.split(' - ')[1] || rawUni
  } else if (rawUni.toLowerCase().startsWith('universidad en ')) {
    customUniName = rawUni.replace(/universidad en /i, '')
  }

  return {
    hasLogo: false,
    logoUrl: null,
    flag: countryInfo.flag || '🇨🇱',
    primaryLabel: customUniName && customUniName !== 'Otra Universidad' && customUniName !== 'Universidad Extranjera (Fuera de Chile)'
      ? customUniName
      : countryInfo.name,
    fullName: rawUni || `Médico ${countryInfo.name}`,
    subLabel: rawSede || countryInfo.name,
    countryName: countryInfo.name,
    sede: rawSede || countryInfo.name
  }
}

// ─── REUSABLE REACT COMPONENT: UserInstitutionBadge ────────────────────────
export function UserInstitutionBadge({
  user,
  university,
  sede,
  country,
  size = 24, // 18, 24, 32, 40
  showLabel = false,
  labelStyle = {},
  style = {},
  className = ''
}) {
  const [imgError, setImgError] = useState(false)

  const badge = getUserInstitutionBadge(
    user || { university, sede, country }
  )

  const containerSize = size
  const imgSize = Math.max(14, Math.round(size * 0.85))

  const iconElement = (badge.hasLogo && badge.logoUrl && !imgError)
    ? React.createElement('img', {
        src: badge.logoUrl,
        alt: badge.primaryLabel,
        onError: () => setImgError(true),
        style: {
          width: `${imgSize}px`,
          height: `${imgSize}px`,
          objectFit: 'contain',
          display: 'block'
        }
      })
    : React.createElement('span', {
        style: {
          fontSize: `${Math.max(11, Math.round(size * 0.58))}px`,
          lineHeight: 1,
          userSelect: 'none'
        }
      }, badge.flag || '🇨🇱')

  const containerElement = React.createElement('div', {
    style: {
      width: `${containerSize}px`,
      height: `${containerSize}px`,
      minWidth: `${containerSize}px`,
      minHeight: `${containerSize}px`,
      borderRadius: '50%',
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      border: '1.5px solid rgba(255, 255, 255, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      flexShrink: 0,
      backgroundClip: 'padding-box'
    }
  }, iconElement)

  const labelElement = showLabel
    ? React.createElement('span', {
        style: {
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--surface-300, #94a3b8)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...labelStyle
        }
      }, `${badge.primaryLabel} ${badge.subLabel && badge.subLabel !== badge.primaryLabel ? `· ${badge.subLabel}` : ''}`)
    : null

  return React.createElement('div', {
    className: `user-institution-badge ${className}`,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      ...style
    },
    title: `${badge.fullName || badge.primaryLabel} ${badge.sede ? `(${badge.sede})` : ''} - ${badge.countryName}`
  }, containerElement, labelElement)
}

