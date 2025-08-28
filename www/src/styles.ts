// because we can't use the latest version of the DS in this repo yet, we basically need to polyfill some newer stuff
// also maybe stuff that's different between app and console/rest of DS (like the primary color- should revisit this with new designer)
import {
  styledThemeDark,
  styledThemeLight,
  honorableThemeDark,
  honorableThemeLight,
} from '@pluralsh/design-system'

const grey = styledThemeDark.colors.grey

export const polyfilledStyledThemeDark = {
  ...styledThemeDark,
  colors: {
    ...styledThemeDark.colors,
    'fill-accent': grey[950],
    'action-primary': '#7B28FF' as string,
    'action-primary-hover': '#914DFF' as string,
  },
}

export const polyfilledStyledThemeLight = {
  ...styledThemeLight,
  colors: { ...styledThemeLight.colors, 'fill-accent': grey[25] },
}

export const polyfilledHonorableThemeDark = {
  ...honorableThemeDark,
  colors: {
    ...honorableThemeDark.colors,
    'action-primary': '#7B28FF' as string,
    'action-primary-hover': '#914DFF' as string,
  },
}

export const polyfilledHonorableThemeLight = {
  ...honorableThemeLight,
  colors: {
    ...honorableThemeLight.colors,
    'action-primary': '#7B28FF' as string,
    'action-primary-hover': '#914DFF' as string,
  },
}
