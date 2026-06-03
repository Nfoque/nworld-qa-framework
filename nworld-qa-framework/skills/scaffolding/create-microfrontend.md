# Create Microfrontend

Expose an existing feature as a Module Federation microfrontend with the full provider wrapper.

## Input

$ARGUMENTS = `{domain}/{feature-name}` (e.g., `remotes/counter`)

## Instructions

1. Parse the input and verify:
   - The domain exists in `src/domains/`
   - The feature exists in `src/domains/{domain}/features/{feature-name}/`
   - No `mf-{feature-name}.tsx` already exists in that feature

2. Read the feature's main component to understand its Props type.

3. Create the MFE wrapper file:

### `mf-{feature-name}.tsx`
```typescript
import { microfrontend } from "@amiga-fwk-web/components-microfrontends";
import { IntlProvider } from "@amiga-fwk-web/components-intl";
import { GrowthbookProvider } from "@amiga-fwk-web/components-growthbook";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { {FeatureName}, type {FeatureName}Props } from "./{feature-name}";
import { queryClient } from "@/shared/api/query-client";
import locales from "@/shared/locales";

const {FeatureName}Mfe = microfrontend<{FeatureName}Props>((props) => (
  <IntlProvider locales={locales} defaultLocale="en">
    <GrowthbookProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <{FeatureName} {...props} />
        </BrowserRouter>
      </QueryClientProvider>
    </GrowthbookProvider>
  </IntlProvider>
));

export default {FeatureName}Mfe;
```

4. Update `config/webpack.microfrontends.js` — add the new expose entry:

```javascript
{FeatureName}: "./domains/{domain}/features/{feature-name}/mf-{feature-name}.tsx",
```

5. Add an event bus schema entry in `src/shared/eventbus/` if the MFE needs to communicate with the shell or other MFEs. Use the namespace pattern: `{APP_NAME}::{event-name}`.

6. Update the domain's README.md to note this feature is exposed as an MFE.

7. Update the relevant configmap(s) if the MFE needs to be consumed by a shell:
   - `application-configmap.yml` — local URL
   - `application-configmap_mock.yml` — mock URL
   - `application-configmap_pre.yml` — pre-production URL

8. Report what was created and list the full Module Federation remote path for consumers.
