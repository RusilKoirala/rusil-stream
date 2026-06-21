function hasConfiguredValue(value: string | undefined, placeholder: string): boolean {
  return Boolean(value && value.length > 0 && !value.includes(placeholder));
}

export function hasClerkClientConfig(): boolean {
  return hasConfiguredValue(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    'your_publishable_key'
  );
}

export function hasClerkServerConfig(): boolean {
  return (
    hasClerkClientConfig() &&
    hasConfiguredValue(process.env.CLERK_SECRET_KEY, 'your_secret_key')
  );
}
