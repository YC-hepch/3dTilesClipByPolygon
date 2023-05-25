# 3dTilesClipByPolygon
原生Ceisum 多边形裁剪3dtiles模型
#使用示例
  coordinates = [
                [106.443237643721, 29.46804376199225],
                [106.443237643721, 29.49579683916092],
                [106.500710551558, 29.49579683916092],
                [106.499071590308, 29.46301761415856],
                [106.490986048141, 29.443022286907117],
                [106.451323185888, 29.450780036824349]
            ]
            const CeiumPolygonClipA = new CeiumPolygonClip({
                tileSet: tilesetBM,
                originPositions: coordinates,
                unionClippingRegions: false
            })
            CeiumPolygonClipA.clippingByPositions()

