import { getCrop, SOILS, stageLabel } from "./crops";
import type { CropPlan, Farm, User } from "./store";
import type { WeatherSnapshot } from "./weather-types";

/** Compact farm brief handed to the AI assistant so it answers about THIS farm. */
export function farmContext(user: User | null, farm?: Farm, plan?: CropPlan, weather?: WeatherSnapshot | null) {
  if (!farm) return `Farmer: ${user?.name ?? "unknown"}, location ${user?.location ?? "unknown"}. No farm added yet.`;
  const crop = getCrop(plan?.crop ?? farm.crop ?? "");
  const inputs = plan?.inputs ?? { treeAge: farm.treeAge, plantingDate: farm.plantingDate };
  const stage = crop ? stageLabel(crop, inputs).label.en : "unknown";
  const soil = SOILS.find((s) => s.id === farm.soil)?.label.en ?? "unknown";
  const st = farm.soilTest;
  const where = farm.locationSource === "gps" ? "detected from the farmer's device" : farm.locationSource ? "entered manually by the farmer" : "unknown";
  return [
    `Farmer: ${user?.name ?? "unknown"}`,
    `Farm: ${farm.name}, ${farm.location}, ${farm.area ?? "?"} acres (location ${where})`,
    `Crop: ${crop?.name.en ?? plan?.customName ?? farm.crop ?? "not set"}${farm.variety ? ` (${farm.variety})` : ""}`,
    farm.treeAge !== undefined ? `Tree age: ${farm.treeAge} years` : "",
    `Current stage: ${stage}`,
    `Soil: ${soil}; water source: ${farm.waterSource ?? "unknown"}`,
    st ? `Soil test (kg/ha): N ${st.n ?? "?"}, P ${st.p ?? "?"}, K ${st.k ?? "?"}, pH ${st.ph ?? "?"}` : "No soil test",
    `Today: ${new Date().toDateString()}`,
    weather
      ? [
          `Live weather for ${farm.location} (${weather.source}, retrieved ${new Date(weather.fetchedAt).toLocaleString()}):`,
          `${weather.condition.en}, ${weather.temp}°C (feels ${weather.feels}°C), humidity ${weather.humidity}%,`,
          `rain probability ${weather.rain}%, wind ${weather.wind} km/h (gusts ${weather.gust}), cloud cover ${weather.cloudCover}%,`,
          `thunderstorm probability ${weather.thunder}%, UV ${weather.uv}, visibility ${weather.visibility} km.`,
          weather.forecast.length
            ? `Next days: ${weather.forecast.map((d) => `${d.day.en} ${d.icon} ${d.max}/${d.min}°C, rain ${d.rain}%`).join("; ")}.`
            : "",
        ]
          .filter(Boolean)
          .join(" ")
      : "No live weather has been loaded for this farm yet — say so if weather matters to the answer.",
  ]
    .filter(Boolean)
    .join("\n");
}
