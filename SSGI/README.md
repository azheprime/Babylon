SSGI算法：半球随机采样 + 屏幕空间光线步进检测 + 降噪

关键函数：

     GetCosHemisphereSample ：半球内随机采样光线方向
     RayMarch  ：屏幕空间光线步进检测  步长0.05，步数15，最大距离1.0（屏幕空间） 
     FilterShader ： 圆形采样相似深度像素，半径为12.0, 16个方向，
                     每个方向6步（像素坐标）

webGL 和 webGPU（Postprocess）用后处理的方法，
webGPU（Compute Shader）在计算着色器中实现

可能的问题 ： 

1. webGPU实现中，从GBuffer中获取的深度贴图格式比较特殊，让Babylon.js使用默认采样器即什么也不设置，自己设置采样器会出现纹理与采样器不匹配的问题。

2. 计算着色器中若使用textureLoad采样，资源声明中不要声明采样器，传入纹理资源后面要加入参数false，否则babylon.js会自动绑定采样器，出现绑定资源数与声明资源数出匹配的问题。

