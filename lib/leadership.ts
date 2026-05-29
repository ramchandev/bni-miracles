export const LEADERSHIP_WITH_ROLES_SELECT = `
  *,
  leadership_roles (
    *,
    leadership_assignments (
      *,
      members (
        id,
        name,
        slug,
        category,
        business_name,
        profile_picture_url
      )
    )
  )
` as const;
