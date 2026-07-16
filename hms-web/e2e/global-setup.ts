/**
 * Fails fast with a clear message if hms-api isn't already running, instead
 * of letting every single test individually time out against a dead
 * backend. Playwright's own webServer only auto-starts the Angular dev
 * server (fast, no external dependencies) - the Java backend needs a live
 * MySQL connection and is too slow/fragile to reliably auto-start here.
 */
export default async function globalSetup(): Promise<void> {
  const healthUrl = 'http://localhost:8080/actuator/health';
  try {
    const response = await fetch(healthUrl);
    const body = (await response.json()) as { status?: string };
    if (!response.ok || body.status !== 'UP') {
      throw new Error(`Unexpected response from ${healthUrl}: ${response.status} ${JSON.stringify(body)}`);
    }
  } catch (error) {
    throw new Error(
      `hms-api does not appear to be running at ${healthUrl}. Start it first (mvnw spring-boot:run in hms-api), ` +
        `then re-run the tests.\nOriginal error: ${(error as Error).message}`
    );
  }
}
