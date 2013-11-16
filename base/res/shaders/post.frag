#version 330

////////////////////////////
//       ENUMERATIONS
////////////////////////////

#define	DISPLAY_DEPTH 0
#define	DISPLAY_NORMAL 1
#define	DISPLAY_POSITION 2
#define	DISPLAY_COLOR 3
#define	DISPLAY_TOTAL 4
#define	DISPLAY_LIGHTS 5
#define	DISPLAY_BLOOM 8

/////////////////////////////////////
// Uniforms, Attributes, and Outputs
////////////////////////////////////
uniform sampler2D u_Posttex;
uniform sampler2D u_RandomNormaltex;
uniform sampler2D u_RandomScalartex;
uniform sampler2D u_BloomPass1tex;

uniform int u_ScreenWidth;
uniform int u_ScreenHeight;
uniform int u_DisplayType;

in vec2 fs_Texcoord;

out vec4 out_Color;
///////////////////////////////////////

uniform float zerothresh = 1.0f;
uniform float falloff = 0.1f;
uniform int kernelY = 100;

/////////////////////////////////////
//				UTILITY FUNCTIONS
/////////////////////////////////////

//Helper function to automicatlly sample and unpack positions
vec3 sampleCol(vec2 texcoords) {
    return texture(u_Posttex,texcoords).xyz;
}

vec3 sampleBloomPass1(vec2 texcoords) {
    return texture(u_BloomPass1tex,texcoords).xyz;
}

//Get a random normal vector  given a screen-space texture coordinate
//Actually accesses a texture of random vectors
vec3 getRandomNormal(vec2 texcoords) {
    ivec2 sz = textureSize(u_RandomNormaltex,0);
    return texture(u_RandomNormaltex,vec2(texcoords.s* (u_ScreenWidth)/sz.x,
                (texcoords.t)*(u_ScreenHeight)/sz.y)).rgb;
}


//Get a random scalar given a screen-space texture coordinate
//Fetches from a random texture
float getRandomScalar(vec2 texcoords) {
    ivec2 sz = textureSize(u_RandomScalartex,0);
    return texture(u_RandomScalartex,vec2(texcoords.s*u_ScreenWidth/sz.x,
                texcoords.t*u_ScreenHeight/sz.y)).r;
}

//float calculateOcclusionFactor()
//{
//	vec3 rvec = getRandomNormal(fs_Texcoord);
//	rvec = vec3( rvec.z, rvec.y,0.0);
//	vec3 normal = sampleNrm(fs_Texcoord);
//	vec3 tangent = normalize( (rvec - normal )* dot(rvec, normal));
//	vec3 bitangent = cross(normal, tangent);
//	mat3 tbn = mat3(tangent, bitangent, normal);
//	float occlusion = 0.0;
//	vec3 origin = samplePos(fs_Texcoord);
//	float uRadius = 0.3;
//
//	for (int i = 0; i < 16; ++i) {
//		// get sample position:
//		//vec3 sample = tbn * poissonSphere[i];
//		vec3 sample = poissonSphere[i] * uRadius + origin;
//  
//		// project sample position:
//		vec4 offset = vec4(sample, 1.0);
//		offset = u_Persp * offset;
//		offset.xy /= offset.w;
//		offset.xy = offset.xy * 0.5 + 0.5;
//  
//		// get sample depth:
//		float sampleDepth = texture(u_Depthtex, offset.xy).r;
//		//float sampleDepth = linearizeDepth(exp_depth,u_Near,u_Far);
//  
//		// range check & accumulate:
//		float rangeCheck= abs(origin.z - sampleDepth) < uRadius ? 1.0 : 0.0;
//		occlusion += (sampleDepth >= sample.z ? 1.0 : 0.0) * rangeCheck;
//		}
//	 occlusion/=16.0;
//	 return occlusion;
//}

///////////////////////////////////
// MAIN
//////////////////////////////////
const float occlusion_strength = 1.5f;
void main() {


	vec3 bloomColor = vec3(0.0);

	if (u_DisplayType == DISPLAY_BLOOM)
	{
	int kyHalf = kernelY/2;
	int count = 0;
	float delY = 1.0/u_ScreenHeight;
	for(int i=-kyHalf; i<=kyHalf; ++i)
	{
		vec2 texCoord = vec2(fs_Texcoord.s, fs_Texcoord.t+i*delY);
		vec3 color = sampleBloomPass1(texCoord);
		bloomColor += color;
		count++;
	}
	
		bloomColor = 1.0/count * bloomColor;
	}
    vec3 color = sampleCol(fs_Texcoord)+5*bloomColor;
    float gray = dot(color, vec3(0.2125, 0.7154, 0.0721));
    float vin = min(2*distance(vec2(0.5), fs_Texcoord), 1.0);
    out_Color = vec4(mix(pow(color,vec3(1.0/1.8)),vec3(gray),vin), 1.0);

	//out_Color =  vec4(sampleBloomPass1(fs_Texcoord),1.0);
	//out_Color = vec4(bloomColor,1.0);
    return;
}

