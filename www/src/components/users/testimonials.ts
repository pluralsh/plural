export type Testimonial = {
  text: string
  role: string
  company: string
}

// Rotated on the login hero; add entries here to include them in the rotation
export const TESTIMONIALS: Testimonial[] = [
  {
    text: 'Plural has significantly enhanced our overall efficiency. Our developers focus more on innovation.',
    role: 'Head of Platform Services',
    company: 'Global engineering firm',
  },
  {
    text: 'We reduced our k8s upgrade cycles from 3 months to 1 day, and delegated them from principal engineers to a single mid-level engineer.',
    role: 'Director of DevOps',
    company: 'Global cybersecurity provider',
  },
]
