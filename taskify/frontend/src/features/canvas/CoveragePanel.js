import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { COVERAGE_DIMENSION_LABELS, REQUIRED_COVERAGE_DIMENSIONS } from "../../domain/models/CoverageResult";
import { evaluateMinimumCoverage } from "../../domain/rules/coverageRules";
export function CoveragePanel({ items }) {
    const result = evaluateMinimumCoverage(items);
    return (_jsxs("section", { children: [_jsx("h4", { children: "COBERTURA DEL AN\u00C1LISIS" }), _jsx("ul", { children: REQUIRED_COVERAGE_DIMENSIONS.map((dimension) => {
                    const covered = result.coveredDimensions.includes(dimension);
                    return (_jsxs("li", { children: [covered ? "✓" : "○", " ", COVERAGE_DIMENSION_LABELS[dimension]] }, dimension));
                }) }), _jsxs("p", { children: [result.coveredCount, " de ", result.requiredCount, " dimensiones m\u00EDnimas cubiertas."] }), result.hasMinimumCoverage ? (_jsx("p", { children: "Cobertura m\u00EDnima alcanzada." })) : (_jsxs(_Fragment, { children: [_jsx("p", { children: "Falta:" }), _jsx("ul", { children: result.missingDimensions.map((dimension) => (_jsx("li", { children: COVERAGE_DIMENSION_LABELS[dimension] }, dimension))) })] }))] }));
}
