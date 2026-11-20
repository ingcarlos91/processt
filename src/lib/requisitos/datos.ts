// Requisitos por artefacto, por frente de verificación (docs/requisitos/*.json → src/lib/requisitos/<letra>.ts).
import type { Requisito } from "./index";
import { REQUISITOS_A } from "./a";
import { REQUISITOS_B } from "./b";
import { REQUISITOS_C } from "./c";
import { REQUISITOS_D } from "./d";
import { REQUISITOS_E } from "./e";
import { REQUISITOS_F } from "./f";

export const REQUISITOS_DATOS: Record<string, Requisito[]> = { ...REQUISITOS_A, ...REQUISITOS_B, ...REQUISITOS_C, ...REQUISITOS_D, ...REQUISITOS_E, ...REQUISITOS_F };
