import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Path, Svg } from "react-native-svg";
import { siAppletv, siHbomax, siNetflix } from "simple-icons";

interface IconProps {
  size?: number;
  color?: string;
}

function SimpleIcon({ path, size = 32, color = "#FFFFFF" }: { path: string; size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityRole="image">
      <Path d={path} fill={color} />
    </Svg>
  );
}

export function SiNetflixIcon({ size = 32, color = "#FFFFFF" }: IconProps) {
  return <SimpleIcon path={siNetflix.path} size={size} color={color} />;
}

export function SiHbomaxIcon({ size = 32, color = "#FFFFFF" }: IconProps) {
  return <SimpleIcon path={siHbomax.path} size={size} color={color} />;
}

export function SiAppletvIcon({ size = 32, color = "#FFFFFF" }: IconProps) {
  return <SimpleIcon path={siAppletv.path} size={size} color={color} />;
}

export function TbBrandDisneyIcon({ size = 32, color = "#FFFFFF" }: IconProps) {
  return <FontAwesome5 name="disney" size={size} color={color} />;
}

export function FaAmazonIcon({ size = 32, color = "#FFFFFF" }: IconProps) {
  return <FontAwesome5 name="amazon" size={size} color={color} />;
}