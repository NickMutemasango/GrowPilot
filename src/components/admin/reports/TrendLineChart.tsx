import { axisTicks, niceAxisMax, type ReportPoint } from "@/lib/admin/reports";

type TrendLineChartProps = {
  points: ReportPoint[];
  /** The legend's wording, e.g. "New students per month". */
  legend: string;
  /** What one unit is, for tooltips and the hidden table: "student" / "students". */
  unit: { one: string; many: string };
  /** A short line beside the legend, e.g. "17 registered in all". */
  summary?: string;
  /** What the hidden table's value column is called, e.g. "New students". */
  valueHeading: string;
  /** Said at the start of the chart's description, e.g. "Line chart of new student registrations per month." */
  description: string;
  /** Shade under the line. Off for a running total, where the area says nothing extra. */
  shaded?: boolean;
  /**
   * How a value is said in words: money has to carry its currency, a
   * count does not. Used for the scale, the tooltips and the table.
   */
  formatValue?: (value: number) => string;
};

/*
 * A month-by-month line, drawn as plain SVG.
 *
 * The same chart serves registrations and the running total, because
 * they are the same shape of thing: one number per month. It carries
 * its own labels, a legend, a <title> tooltip on every point, and the
 * same figures again as a visually hidden table — a chart nobody can
 * read is not information.
 *
 * Labels are drawn at a size that stays legible once the SVG is scaled
 * down; below the width where that holds, the chart scrolls inside its
 * own box rather than shrinking further.
 */

const WIDTH = 720;
const HEIGHT = 260;
const PADDING = { top: 18, right: 18, bottom: 46, left: 56 };
const PLOT = {
  width: WIDTH - PADDING.left - PADDING.right,
  height: HEIGHT - PADDING.top - PADDING.bottom,
};

export function TrendLineChart({
  points,
  legend,
  unit,
  summary,
  valueHeading,
  description,
  shaded = true,
  formatValue,
}: TrendLineChartProps) {
  const say = (value: number) =>
    formatValue ? formatValue(value) : `${value} ${value === 1 ? unit.one : unit.many}`;
  const max = niceAxisMax(Math.max(...points.map((point) => point.value), 0));
  const ticks = axisTicks(max);

  const x = (index: number) =>
    PADDING.left + (points.length === 1 ? PLOT.width / 2 : (PLOT.width / (points.length - 1)) * index);
  const y = (value: number) => PADDING.top + PLOT.height - (value / max) * PLOT.height;

  const plotted = points.map((point, index) => ({ ...point, cx: x(index), cy: y(point.value) }));
  const line = plotted.map((point) => `${point.cx},${point.cy}`).join(" ");
  const area = `${PADDING.left},${PADDING.top + PLOT.height} ${line} ${x(points.length - 1)},${PADDING.top + PLOT.height}`;
  // Twelve months would collide on a narrow chart, so every other label is drawn.
  const labelEvery = points.length > 8 ? 2 : 1;

  return (
    <figure className="m-0 flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <span aria-hidden="true" className="inline-block h-1 w-6 rounded-full bg-primary" />
          {legend}
        </p>
        {summary && <p className="text-sm text-ink-muted">{summary}</p>}
      </div>

      <p className="text-sm text-ink-muted sm:hidden">Swipe sideways to see the whole chart.</p>
      {/* Focusable, so the chart can also be scrolled with the keyboard. */}
      <div tabIndex={0} role="group" aria-label="Chart, scrolls sideways" className="-mx-1 overflow-x-auto px-1">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full min-w-[34rem]"
          role="img"
          aria-label={`${description} ${points.map((point) => `${point.fullLabel}: ${say(point.value)}`).join(". ")}.`}
        >
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
                {formatValue ? formatValue(tick) : Math.round(tick)}
              </text>
            </g>
          ))}

          {shaded && <polyline points={area} className="fill-secondary" opacity={0.7} stroke="none" />}
          <polyline
            points={line}
            fill="none"
            className="stroke-primary"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {plotted.map((point, index) => (
            <g key={point.key}>
              {/* A generous invisible target, so the tooltip is easy to hit. */}
              <circle cx={point.cx} cy={point.cy} r={16} fill="transparent">
                <title>{`${point.fullLabel}: ${say(point.value)}`}</title>
              </circle>
              <circle cx={point.cx} cy={point.cy} r={4.5} className="fill-surface stroke-primary" strokeWidth={3} />
              {index % labelEvery === 0 && (
                <text
                  x={point.cx}
                  y={HEIGHT - 14}
                  textAnchor="middle"
                  className="fill-ink-muted"
                  style={{ fontSize: 17 }}
                >
                  {point.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      <figcaption className="sr-only">
        <table>
          <caption>{legend}</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">{valueHeading}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.key}>
                <th scope="row">{point.fullLabel}</th>
                <td>{formatValue ? formatValue(point.value) : point.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}
