import { Hono } from "hono";
import { LOFF_RULESET } from "../../rules/loff-ruleset";
import { COA_COUNTRY_LIST } from "../../rules/coa-country-list";
import { COA_ITEM_LIST } from "../../rules/coa-item-list";

const app = new Hono();

app.get("/", (c) =>
  c.json({
    loff: LOFF_RULESET,
    coaCountries: COA_COUNTRY_LIST,
    coaItems: COA_ITEM_LIST,
  })
);

export default app;
