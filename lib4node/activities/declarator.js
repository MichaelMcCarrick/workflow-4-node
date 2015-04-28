"use strict";
var Activity = require("./activity");
var util = require("util");
var StrSet = require("backpack-node").collections.StrSet;
var is = require("../common/is");
var fast = require("fast.js");
function Declarator() {
  Activity.call(this);
  this.nonScopedProperties.add("reservedProperties");
  this.nonScopedProperties.add("reserved");
  this.nonScopedProperties.add("promotedProperties");
  this.nonScopedProperties.add("promoted");
  this.nonScopedProperties.add("varsDeclared");
  this.reservedProperties = new StrSet();
  this.promotedProperties = new StrSet();
}
util.inherits(Declarator, Activity);
Declarator.prototype.reserved = function(name, value) {
  if (this.promotedProperties.exists(name))
    throw new Error("Property '" + name + "' cannot be reserved because it's promoted.");
  if (is.defined(value))
    this[name] = value;
  this.reservedProperties.add(name);
};
Activity.prototype.promoted = function(name, value) {
  if (this.reservedProperties.exists(name))
    throw new Error("Property '" + name + "' cannot be promoted because it's reserved.");
  if (is.defined(value))
    this[name] = value;
  this.promotedProperties.add(name);
};
Declarator.prototype.run = function(callContext, args) {
  var self = this;
  var activityVariables = [];
  var _activityVariableFieldNames = [];
  self.set("_activityVariableFieldNames", _activityVariableFieldNames);
  var resProps = callContext.activity.reservedProperties;
  fast.forEach(callContext.activity._getScopeKeys(), function(fieldName) {
    if (!resProps.exists(fieldName)) {
      var fieldValue = self.get(fieldName);
      if (fieldValue instanceof Activity) {
        activityVariables.push(fieldValue);
        _activityVariableFieldNames.push(fieldName);
      }
    }
  });
  if (activityVariables.length) {
    self.set("_savedArgs", args);
    callContext.schedule(activityVariables, "_varsGot");
  } else {
    self.delete("_activityVariableFieldNames");
    callContext.activity.varsDeclared.call(self, callContext, args);
  }
};
Declarator.prototype._varsGot = function(callContext, reason, result) {
  var self = this;
  if (reason === Activity.states.complete) {
    var idx = 0;
    fast.forEach(self.get("_activityVariableFieldNames"), function(fieldName) {
      self.set(fieldName, result[idx++]);
    });
    var args = self.get("_savedArgs");
    self.delete("_savedArgs");
    self.delete("_activityVariableFieldNames");
    callContext.activity.varsDeclared.call(self, callContext, args);
  } else {
    callContext.end(reason, result);
  }
};
Declarator.prototype.varsDeclared = function(callContext, args) {};
module.exports = Declarator;
//# sourceMappingURL=data:application/json;base64,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QyxDQUFHLFVBQVUsU0FBUSxDQUFHO0FBQ3ZFLFNBQUcsSUFBSSxBQUFDLENBQUMsU0FBUSxDQUFHLENBQUEsTUFBSyxDQUFFLEdBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN0QyxDQUFDLENBQUM7QUFDRixBQUFJLE1BQUEsQ0FBQSxJQUFHLEVBQUksQ0FBQSxJQUFHLElBQUksQUFBQyxDQUFDLFlBQVcsQ0FBQyxDQUFDO0FBQ2pDLE9BQUcsT0FBTyxBQUFDLENBQUMsWUFBVyxDQUFDLENBQUM7QUFDekIsT0FBRyxPQUFPLEFBQUMsQ0FBQyw2QkFBNEIsQ0FBQyxDQUFDO0FBQzFDLGNBQVUsU0FBUyxhQUFhLEtBQUssQUFBQyxDQUFDLElBQUcsQ0FBRyxZQUFVLENBQUcsS0FBRyxDQUFDLENBQUM7RUFDbkUsS0FDSztBQUNELGNBQVUsSUFBSSxBQUFDLENBQUMsTUFBSyxDQUFHLE9BQUssQ0FBQyxDQUFDO0VBQ25DO0FBQUEsQUFDSixDQUFBO0FBRUEsU0FBUyxVQUFVLGFBQWEsRUFBSSxVQUFVLFdBQVUsQ0FBRyxDQUFBLElBQUcsQ0FBRyxHQUNqRSxDQUFBO0FBRUEsS0FBSyxRQUFRLEVBQUksV0FBUyxDQUFDO0FBQUEiLCJmaWxlIjoiYWN0aXZpdGllcy9kZWNsYXJhdG9yLmpzIiwic291cmNlUm9vdCI6IkM6L0dJVC93b3JrZmxvdy00LW5vZGUvbGliLyIsInNvdXJjZXNDb250ZW50IjpbInZhciBBY3Rpdml0eSA9IHJlcXVpcmUoXCIuL2FjdGl2aXR5XCIpO1xyXG52YXIgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xyXG52YXIgU3RyU2V0ID0gcmVxdWlyZShcImJhY2twYWNrLW5vZGVcIikuY29sbGVjdGlvbnMuU3RyU2V0O1xyXG52YXIgaXMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2lzXCIpO1xyXG52YXIgZmFzdCA9IHJlcXVpcmUoXCJmYXN0LmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gRGVjbGFyYXRvcigpIHtcclxuICAgIEFjdGl2aXR5LmNhbGwodGhpcyk7XHJcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwicmVzZXJ2ZWRQcm9wZXJ0aWVzXCIpO1xyXG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcInJlc2VydmVkXCIpO1xyXG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcInByb21vdGVkUHJvcGVydGllc1wiKTtcclxuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJwcm9tb3RlZFwiKTtcclxuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJ2YXJzRGVjbGFyZWRcIik7XHJcblxyXG4gICAgLy8gUHJvcGVydGllcyB0aG9zZSBjYW5ub3QgYmUgZGVjbGFyZWQgZnJlZWx5XHJcbiAgICB0aGlzLnJlc2VydmVkUHJvcGVydGllcyA9IG5ldyBTdHJTZXQoKTtcclxuXHJcbiAgICAvLyBQcm9wZXJ0aWVzIHRob3NlIHdpbGwgYmUgcHJvbW90ZWQgZHVyaW5nIHNlcmlhbGl6YXRpb25cclxuICAgIHRoaXMucHJvbW90ZWRQcm9wZXJ0aWVzID0gbmV3IFN0clNldCgpO1xyXG59XHJcblxyXG51dGlsLmluaGVyaXRzKERlY2xhcmF0b3IsIEFjdGl2aXR5KTtcclxuXHJcbkRlY2xhcmF0b3IucHJvdG90eXBlLnJlc2VydmVkID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XHJcbiAgICBpZiAodGhpcy5wcm9tb3RlZFByb3BlcnRpZXMuZXhpc3RzKG5hbWUpKSB0aHJvdyBuZXcgRXJyb3IoXCJQcm9wZXJ0eSAnXCIgKyBuYW1lICsgXCInIGNhbm5vdCBiZSByZXNlcnZlZCBiZWNhdXNlIGl0J3MgcHJvbW90ZWQuXCIpO1xyXG4gICAgaWYgKGlzLmRlZmluZWQodmFsdWUpKSB0aGlzW25hbWVdID0gdmFsdWU7XHJcbiAgICB0aGlzLnJlc2VydmVkUHJvcGVydGllcy5hZGQobmFtZSk7XHJcbn1cclxuXHJcbkFjdGl2aXR5LnByb3RvdHlwZS5wcm9tb3RlZCA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xyXG4gICAgaWYgKHRoaXMucmVzZXJ2ZWRQcm9wZXJ0aWVzLmV4aXN0cyhuYW1lKSkgdGhyb3cgbmV3IEVycm9yKFwiUHJvcGVydHkgJ1wiICsgbmFtZSArIFwiJyBjYW5ub3QgYmUgcHJvbW90ZWQgYmVjYXVzZSBpdCdzIHJlc2VydmVkLlwiKTtcclxuICAgIGlmIChpcy5kZWZpbmVkKHZhbHVlKSkgdGhpc1tuYW1lXSA9IHZhbHVlO1xyXG4gICAgdGhpcy5wcm9tb3RlZFByb3BlcnRpZXMuYWRkKG5hbWUpO1xyXG59XHJcblxyXG5EZWNsYXJhdG9yLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIGFyZ3MpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIHZhciBhY3Rpdml0eVZhcmlhYmxlcyA9IFtdO1xyXG4gICAgdmFyIF9hY3Rpdml0eVZhcmlhYmxlRmllbGROYW1lcyA9IFtdO1xyXG4gICAgc2VsZi5zZXQoXCJfYWN0aXZpdHlWYXJpYWJsZUZpZWxkTmFtZXNcIiwgX2FjdGl2aXR5VmFyaWFibGVGaWVsZE5hbWVzKTtcclxuICAgIHZhciByZXNQcm9wcyA9IGNhbGxDb250ZXh0LmFjdGl2aXR5LnJlc2VydmVkUHJvcGVydGllcztcclxuICAgIGZhc3QuZm9yRWFjaChjYWxsQ29udGV4dC5hY3Rpdml0eS5fZ2V0U2NvcGVLZXlzKCksIGZ1bmN0aW9uIChmaWVsZE5hbWUpIHtcclxuICAgICAgICBpZiAoIXJlc1Byb3BzLmV4aXN0cyhmaWVsZE5hbWUpKSB7XHJcbiAgICAgICAgICAgIHZhciBmaWVsZFZhbHVlID0gc2VsZi5nZXQoZmllbGROYW1lKTtcclxuICAgICAgICAgICAgaWYgKGZpZWxkVmFsdWUgaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xyXG4gICAgICAgICAgICAgICAgYWN0aXZpdHlWYXJpYWJsZXMucHVzaChmaWVsZFZhbHVlKTtcclxuICAgICAgICAgICAgICAgIF9hY3Rpdml0eVZhcmlhYmxlRmllbGROYW1lcy5wdXNoKGZpZWxkTmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoYWN0aXZpdHlWYXJpYWJsZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgc2VsZi5zZXQoXCJfc2F2ZWRBcmdzXCIsIGFyZ3MpO1xyXG4gICAgICAgIGNhbGxDb250ZXh0LnNjaGVkdWxlKGFjdGl2aXR5VmFyaWFibGVzLCBcIl92YXJzR290XCIpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgc2VsZi5kZWxldGUoXCJfYWN0aXZpdHlWYXJpYWJsZUZpZWxkTmFtZXNcIik7XHJcbiAgICAgICAgY2FsbENvbnRleHQuYWN0aXZpdHkudmFyc0RlY2xhcmVkLmNhbGwoc2VsZiwgY2FsbENvbnRleHQsIGFyZ3MpO1xyXG4gICAgfVxyXG59XHJcblxyXG5EZWNsYXJhdG9yLnByb3RvdHlwZS5fdmFyc0dvdCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgcmVhc29uLCByZXN1bHQpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIGlmIChyZWFzb24gPT09IEFjdGl2aXR5LnN0YXRlcy5jb21wbGV0ZSkge1xyXG4gICAgICAgIHZhciBpZHggPSAwO1xyXG4gICAgICAgIGZhc3QuZm9yRWFjaChzZWxmLmdldChcIl9hY3Rpdml0eVZhcmlhYmxlRmllbGROYW1lc1wiKSwgZnVuY3Rpb24gKGZpZWxkTmFtZSkge1xyXG4gICAgICAgICAgICBzZWxmLnNldChmaWVsZE5hbWUsIHJlc3VsdFtpZHgrK10pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBhcmdzID0gc2VsZi5nZXQoXCJfc2F2ZWRBcmdzXCIpO1xyXG4gICAgICAgIHNlbGYuZGVsZXRlKFwiX3NhdmVkQXJnc1wiKTtcclxuICAgICAgICBzZWxmLmRlbGV0ZShcIl9hY3Rpdml0eVZhcmlhYmxlRmllbGROYW1lc1wiKTtcclxuICAgICAgICBjYWxsQ29udGV4dC5hY3Rpdml0eS52YXJzRGVjbGFyZWQuY2FsbChzZWxmLCBjYWxsQ29udGV4dCwgYXJncyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBjYWxsQ29udGV4dC5lbmQocmVhc29uLCByZXN1bHQpO1xyXG4gICAgfVxyXG59XHJcblxyXG5EZWNsYXJhdG9yLnByb3RvdHlwZS52YXJzRGVjbGFyZWQgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIGFyZ3MpIHtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEZWNsYXJhdG9yOyJdfQ==