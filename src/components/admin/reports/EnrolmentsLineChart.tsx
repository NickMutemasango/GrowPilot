import { axisTicks, niceAxisMax, type ReportMonth } from "@/lib/admin/reports";

type EnrolmentsLineChartProps = {
  months: ReportMonth[];
};

/*
 * Monthly enrolments, drawn as plain SVG.
 *
 * This project has no charting library, and one chart is not a reason to
 * add one: a line and some labels are a few lines of geometry, and
 * hand-drawn SVG keeps the page's weight, its colours and its
 * accessibility under our own control.
 *
 * READABLE WITHOUT THE PICTURE. The chart is labelled for screen
 * readers and followed by the same numbers as a real table, which is
 * visually hidden — a chart nobody can read is not information. Each
 * point also carries a <title>, which browsers show as a tooltip on
 * hover and focus.
 */

/* The drawing grid. The SVG scales to its container; these are its own units. */
const WIDTH = 720;
const HEIGHT = 280;
const PADDING = { top: 18, right: 18, bottom: 46, left: 56 };
const PLOT = {
  width: WIDTH - PADDING.left - PADDING.right,
  height: HEIGHT - PADDING.top - PADDING.bottom,
};

export function EnrolmentsLineChart({ months }: EnrolmentsLineChartProps) {
  const max = niceAxisMax(Math.max(...months.map((month) => month.enrolments), 0));
  const ticks = axisTicks(max);
  const total = months.reduce((sum, month) => sum + month.enrolments, 0);

  const x = (index: number) =>
    PADDING.left + (months.length === 1 ? PLOT.width / 2 : (PLOT.width / (months.length - 1)) * index);
  const y = (value: number) => PADDING.top + PLOT.height - (value / max) * PLOT.height;

  const points = months.map((month, index) => ({ ...month, cx: x(index), cy: y(month.enrolments) }));
  const line = points.map((point) => `${point.cx},${point.cy}`).join(" ");
  const area = `${PADDING.left},${PADDING.top + PLOT.height} ${line} ${x(months.length - 1)},${PADDING.top + PLOT.height}`;

  return (
    <figure className="m-0 flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <span aria-hidden="true" className="inline-block h-1 w-6 rounded-full bg-primary" />
          Enrolments per month
        </p>
        <p className="text-sm text-ink-muted">
          {total} {total === 1 ? "enrolment" : "enrolments"} over {months.length} months
        </p>
      </div>

      <p className="text-sm text-ink-muted sm:hidden">Swipe sideways to see the whole chart.</p>
      {/*
        On a narrow screen the chart scrolls inside its own box rather than
        shrinking: squeezed into 300 pixels the month labels and the scale
        become too small to read, which is worse than a swipe.
      */}
      {/* Focusable, so the chart can also be scrolled with the keyboard. */}
      <div tabIndex={0} role="group" aria-label="Chart, scrolls sideways" className="-mx-1 overflow-x-auto px-1">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full min-w-[34rem]"
          role="img"
          aria-label={`Line chart of enrolments per month. ${months
            .map((month) => `${month.fullLabel}: ${month.enrolments}`)
            .join(". ")}.`}
        >
          {/* Grid lines and the scale down the left, so a point can be read as a number. */}
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={y(tick)}
                y2={y(tick)}
                className="stroke-line"
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 10}
                y={y(tick) + 6}
                textAnchor="end"
                className="fill-ink-muted"
                style={{ fontSize: 16 }}
              >
                {Math.round(tick)}
              </text>
            </g>
          ))}

          {/* The shaded area is decoration; the line is the data. */}
          <polyline points={area} className="fill-secondary" opacity={0.7} stroke="none" />
          <polyline
            points={line}
            fill="none"
            className="stroke-primary"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point) => (
            <g key={point.key}>
              {/* A generous invisible target, so the tooltip is easy to hit. */}
              <circle cx={point.cx} cy={point.cy} r={18} fill="transparent">
                <title>
                  {`${point.fullLabel}: ${point.enrolments} ${point.enrolments === 1 ? "enrolment" : "enrolments"}`}
                </title>
              </circle>
              <circle cx={point.cx} cy={point.cy} r={5} className="fill-surface stroke-primary" strokeWidth={3} />
              <text x={point.cx} y={HEIGHT - 14} textAnchor="middle" className="fill-ink-muted" style={{ fontSize: 18 }}>
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <figcaption className="sr-only">
        <table>
          <caption>Enrolments per month</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Enrolments</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month) => (
              <tr key={month.key}>
                <th scope="row">{month.fullLabel}</th>
                <td>{month.enrolments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}
