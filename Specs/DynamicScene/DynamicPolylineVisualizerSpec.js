/*global defineSuite*/
defineSuite([
             'DynamicScene/DynamicPolylineVisualizer',
             '../Specs/createScene',
             '../Specs/destroyScene',
             '../Specs/MockProperty',
             'DynamicScene/DynamicPolyline',
             'DynamicScene/DynamicObjectCollection',
             'DynamicScene/DynamicObject',
             'Core/JulianDate',
             'Core/Cartesian2',
             'Core/Cartesian3',
             'Core/Color',
             'Scene/Scene'
            ], function(
              DynamicPolylineVisualizer,
              createScene,
              destroyScene,
              MockProperty,
              DynamicPolyline,
              DynamicObjectCollection,
              DynamicObject,
              JulianDate,
              Cartesian2,
              Cartesian3,
              Color,
              Scene) {
    "use strict";
    /*global it,expect,beforeEach,afterEach,waitsFor,runs*/

    var scene;
    var visualizer;

    beforeEach(function() {
        scene = createScene();
    });

    afterEach(function() {
        visualizer = visualizer && visualizer.destroy();
        destroyScene(scene);
    });

    it('constructor throws if no scene is passed.', function() {
        expect(function() {
            return new DynamicPolylineVisualizer();
        }).toThrow();
    });

    it('constructor sets expected parameters and adds collection to scene.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicPolylineVisualizer(scene, dynamicObjectCollection);
        expect(visualizer.getScene()).toEqual(scene);
        expect(visualizer.getDynamicObjectCollection()).toEqual(dynamicObjectCollection);
        expect(scene.getPrimitives().getLength()).toEqual(0);
    });

    it('update throws if no time specified.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicPolylineVisualizer(scene, dynamicObjectCollection);
        expect(function() {
            visualizer.update();
        }).toThrow();
    });

    it('update does nothing if no dynamicObjectCollection.', function() {
        visualizer = new DynamicPolylineVisualizer(scene);
        visualizer.update(new JulianDate());
    });

    it('isDestroy returns false until destroyed.', function() {
        visualizer = new DynamicPolylineVisualizer(scene);
        expect(visualizer.isDestroyed()).toEqual(false);
        visualizer.destroy();
        expect(visualizer.isDestroyed()).toEqual(true);
        visualizer = undefined;
    });

    it('object with no polyline does not create one.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicPolylineVisualizer(scene, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.vertexPositions = new MockProperty([new Cartesian3(1234, 5678, 9101112), new Cartesian3(5678, 1234, 1101112)]);
        visualizer.update(new JulianDate());
        expect(scene.getPrimitives().getLength()).toEqual(0);
    });

    it('object with no vertexPosition does not create a polyline.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicPolylineVisualizer(scene, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        var polyline = testObject.polyline = new DynamicPolyline();
        polyline.show = new MockProperty(true);

        visualizer.update(new JulianDate());
        expect(scene.getPrimitives().getLength()).toEqual(0);
    });

    it('A DynamicPolyline causes a primtive to be created and updated.', function() {
        var time = new JulianDate();

        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicPolylineVisualizer(scene, dynamicObjectCollection);

        expect(scene.getPrimitives().getLength()).toEqual(0);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.vertexPositions = new MockProperty([new Cartesian3(1234, 5678, 9101112), new Cartesian3(5678, 1234, 1101112)]);

        var polyline = testObject.polyline = new DynamicPolyline();
        polyline.show = new MockProperty(true);
        polyline.color = new MockProperty(new Color(0.8, 0.7, 0.6, 0.5));
        polyline.width = new MockProperty(12.5);
        polyline.outlineColor = new MockProperty(new Color(0.1, 0.2, 0.3, 0.4));
        polyline.outlineWidth = new MockProperty(2.5);

        visualizer.update(time);

        expect(scene.getPrimitives().getLength()).toEqual(1);

        var primitive = scene.getPrimitives().get(0);

        visualizer.update(time);
        expect(primitive.show).toEqual(testObject.polyline.show.getValue(time));
        expect(primitive.getPositions()).toEqual(testObject.vertexPositions.getValueCartesian(time));
        expect(primitive.color).toEqualProperties(testObject.polyline.color.getValue(time));
        expect(primitive.outlineColor).toEqual(testObject.polyline.outlineColor.getValue(time));
        expect(primitive.outlineWidth).toEqual(testObject.polyline.outlineWidth.getValue(time));
        expect(primitive.width).toEqual(testObject.polyline.width.getValue(time));

        testObject.vertexPositions = new MockProperty([new Cartesian3(5678, 1234, 1101112), new Cartesian3(1234, 5678, 9101112)]);
        polyline.color = new MockProperty(new Color(0.1, 0.2, 0.3, 0.4));
        polyline.width = new MockProperty(2.5);
        polyline.outlineColor = new MockProperty(new Color(0.5, 0.6, 0.7, 0.8));
        polyline.outlineWidth = new MockProperty(12.5);

        visualizer.update(time);
        expect(primitive.show).toEqual(testObject.polyline.show.getValue(time));
        expect(primitive.getPositions()).toEqual(testObject.vertexPositions.getValueCartesian(time));
        expect(primitive.color).toEqualProperties(testObject.polyline.color.getValue(time));
        expect(primitive.outlineColor).toEqual(testObject.polyline.outlineColor.getValue(time));
        expect(primitive.outlineWidth).toEqual(testObject.polyline.outlineWidth.getValue(time));
        expect(primitive.width).toEqual(testObject.polyline.width.getValue(time));

        polyline.show = new MockProperty(false);
        visualizer.update(time);
        expect(primitive.show).toEqual(testObject.polyline.show.getValue(time));
    });

    it('clear hides primitives.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicPolylineVisualizer(scene, dynamicObjectCollection);
        expect(scene.getPrimitives().getLength()).toEqual(0);
        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        var time = new JulianDate();

        testObject.vertexPositions = new MockProperty([new Cartesian3(5678, 1234, 1101112), new Cartesian3(1234, 5678, 9101112)]);
        var polyline = testObject.polyline = new DynamicPolyline();
        polyline.show = new MockProperty(true);
        visualizer.update(time);

        expect(scene.getPrimitives().getLength()).toEqual(1);
        var primitive = scene.getPrimitives().get(0);

        visualizer.update(time);
        //Clearing won't actually remove the primitive because of the
        //internal cache used by the visualizer, instead it just hides it.
        dynamicObjectCollection.clear();
        expect(primitive.show).toEqual(false);
    });

    it('Visualizer sets dynamicObject property.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicPolylineVisualizer(scene, dynamicObjectCollection);

        expect(scene.getPrimitives().getLength()).toEqual(0);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');

        var time = new JulianDate();
        var polyline = testObject.polyline = new DynamicPolyline();

        testObject.vertexPositions = new MockProperty([new Cartesian3(5678, 1234, 1101112), new Cartesian3(1234, 5678, 9101112)]);
        polyline.show = new MockProperty(true);

        visualizer.update(time);
        expect(scene.getPrimitives().getLength()).toEqual(1);
        var primitive = scene.getPrimitives().get(0);
        expect(primitive.dynamicObject).toEqual(testObject);
    });

    it('setDynamicObjectCollection removes old objects and add new ones.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.vertexPositions = new MockProperty([new Cartesian3(5678, 1234, 1101112), new Cartesian3(1234, 5678, 9101112)]);
        testObject.polyline = new DynamicPolyline();
        testObject.polyline.show = new MockProperty(true);

        var dynamicObjectCollection2 = new DynamicObjectCollection();
        var testObject2 = dynamicObjectCollection2.getOrCreateObject('test2');
        testObject2.vertexPositions = new MockProperty([new Cartesian3(1234, 5678, 9101112), new Cartesian3(5678, 1234, 1101112)]);
        testObject2.polyline = new DynamicPolyline();
        testObject2.polyline.show = new MockProperty(true);

        visualizer = new DynamicPolylineVisualizer(scene, dynamicObjectCollection);

        var time = new JulianDate();

        visualizer.update(time);
        expect(scene.getPrimitives().getLength()).toEqual(1);
        var primitive = scene.getPrimitives().get(0);
        expect(primitive.dynamicObject).toEqual(testObject);

        visualizer.setDynamicObjectCollection(dynamicObjectCollection2);
        visualizer.update(time);
        expect(scene.getPrimitives().getLength()).toEqual(1);
        primitive = scene.getPrimitives().get(0);
        expect(primitive.dynamicObject).toEqual(testObject2);
    });
});