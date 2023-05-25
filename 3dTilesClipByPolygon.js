/*
 * @Descripttion: file content
 * @version: 1.0
 * @Author: 予程_hepch
 * @Date: 2023-05-25 09:18:10
 * @LastEditors: 予程_hepch
 * @LastEditTime: 2023-05-25 10:42:39
 */
class tileSetClipByPolygon {
    constructor(options) {
        this.tileSet = options.tileSet || null;
        this.originPositions = options.originPositions || [];
        this.unionClippingRegions = !options.unionClippingRegions ? options.unionClippingRegions : true;
        this.enabled = !options.enabled ? options.enabled : true;
        this.edgeColor = options.edgeColor || Cesium.Color.WHITE;
        this.edgeWidth = options.edgeWidth || 0.0;

    }
    isClockwise(polygon) {
        var area = 0;
        var length = polygon.length;
        for (var i = 0; i < length; i++) {
            var j = (i + 1) % length;
            area += polygon[i][0] * polygon[j][1] - polygon[j][0] * polygon[i][1];
        }
        return area < 0;
    }
    getInverseTransform() {
        let transform
        let tmp = this.tileSet.root.transform
        if ((tmp && tmp.equals(Cesium.Matrix4.IDENTITY)) || !tmp) {
            // 如果root.transform不存在，则3DTiles的原点变成了boundingSphere.center
            transform = Cesium.Transforms.eastNorthUpToFixedFrame(this.tileSet.boundingSphere.center)
        } else {
            transform = Cesium.Matrix4.fromArray(this.tileSet.root.transform)
        }
        return Cesium.Matrix4.inverseTransformation(transform, new Cesium.Matrix4())

    }
    clippingByPositions() {

        const Cartesian3 = Cesium.Cartesian3;
        const pointsLength = this.originPositions.length;
        const clockwise = this.isClockwise(this.originPositions);

        //所有的裁切面
        const clippingPlanes = [];
        let positions;
        if (clockwise) {
            //如果为逆，则需要对数组取反
            positions = this.originPositions.reverse();

        } else {
            positions = this.originPositions
        }
        positions = this.originPositions;
        const inverseTransform = this.getInverseTransform()
        for (let i = 0; i < pointsLength; ++i) {
            const nextIndex = (i + 1) % pointsLength;
            const next = Cesium.Matrix4.multiplyByPoint(
                inverseTransform,
                Cesium.Cartesian3.fromDegrees(positions[nextIndex][0], positions[nextIndex][1]),
                new Cesium.Cartesian3()
            );
            const now = Cesium.Matrix4.multiplyByPoint(
                inverseTransform,
                Cesium.Cartesian3.fromDegrees(positions[i][0], positions[i][1]),
                new Cesium.Cartesian3()
            );
            // 定义一个垂直向上的向量up
            let up = new Cesium.Cartesian3(0, 0, 10);
            //得到指向下一个点的向量
            let right = Cartesian3.subtract(next, now, new Cartesian3());
            right = Cartesian3.normalize(right, right);

            let normal = Cartesian3.cross(right, up, new Cartesian3());
            Cartesian3.normalize(normal, normal);
            //将法向量进行反向
            if (this.unionClippingRegions) {

                Cartesian3.negate(normal, normal);
            }

            //由于已经获得了法向量和过平面的一点，因此可以直接构造Plane,并进一步构造ClippingPlane
            let planeTmp = Cesium.Plane.fromPointNormal(now, normal);
            const clipPlane = Cesium.ClippingPlane.fromPlane(planeTmp);

            clippingPlanes.push(clipPlane);
        }
        let _self = this
        console.log(_self.unionClippingRegions)
        const clipPlanes = new Cesium.ClippingPlaneCollection({
            planes: clippingPlanes,
            edgeWidth: _self.edgeColor,
            edgeColor: _self.edgeColor,
            enabled: _self.enabled,
            unionClippingRegions: _self.unionClippingRegions,
        });
        this.tileSet.clippingPlanes = clipPlanes
    }
    removeTilesetClip() {
        this.tileSet.clippingPlanes.enabled = false
    }

}
window.tileSetClipByPolygon = tileSetClipByPolygon