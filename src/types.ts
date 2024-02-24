// What should a site look like?
export interface Site {
	// A nice name for the site
	label: string;

	// Should this site have specific devices
	devices?: string[]

	// What URLs does this site respond on
	envs: {
		production: string
		local?: string
		staging?: string
	}

	// A Playwright project
	project?: object
}
