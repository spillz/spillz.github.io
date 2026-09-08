const e=`// NewDark Squirrel API bootstrap.\r
//\r
// The native WASM bridge provides:\r
//   __dark_call(serviceName, methodName, argsArray)\r
//   __dark_get_self()\r
//   __dark_get_message()\r
//   __dark_get_userparams()\r
//\r
// This file installs the API-reference service globals as Squirrel objects.\r
\r
class vector {\r
  x = 0.0;\r
  y = 0.0;\r
  z = 0.0;\r
\r
  constructor(a = 0.0, b = null, c = null) {\r
    if (typeof a == "table" || typeof a == "instance") {\r
      x = ("x" in a) ? a.x.tofloat() : 0.0;\r
      y = ("y" in a) ? a.y.tofloat() : 0.0;\r
      z = ("z" in a) ? a.z.tofloat() : 0.0;\r
    } else if (b == null && c == null) {\r
      x = a.tofloat();\r
      y = a.tofloat();\r
      z = a.tofloat();\r
    } else {\r
      x = a.tofloat();\r
      y = (b == null ? 0.0 : b.tofloat());\r
      z = (c == null ? 0.0 : c.tofloat());\r
    }\r
  }\r
\r
  function _add(o) { o = vector(o); return vector(x + o.x, y + o.y, z + o.z); }\r
  function _sub(o) { o = vector(o); return vector(x - o.x, y - o.y, z - o.z); }\r
  function _unm() { return vector(-x, -y, -z); }\r
  function _mul(o) {\r
    if (typeof o == "integer" || typeof o == "float") return vector(x * o, y * o, z * o);\r
    o = vector(o);\r
    return vector(x * o.x, y * o.y, z * o.z);\r
  }\r
  function _div(o) {\r
    if (typeof o == "integer" || typeof o == "float") return vector(x / o, y / o, z / o);\r
    o = vector(o);\r
    return vector(x / o.x, y / o.y, z / o.z);\r
  }\r
  function _tostring() { return x + "," + y + "," + z; }\r
  function LengthSquared() { return x * x + y * y + z * z; }\r
  function Length() { return sqrt(LengthSquared()); }\r
  function Normalize() {\r
    local len = Length();\r
    if (len > 0) {\r
      x /= len;\r
      y /= len;\r
      z /= len;\r
    }\r
    return this;\r
  }\r
  function GetNormalized() { return vector(this).Normalize(); }\r
  function Dot(o) { o = vector(o); return x * o.x + y * o.y + z * o.z; }\r
  function Cross(o) { o = vector(o); return vector(y * o.z - z * o.y, z * o.x - x * o.z, x * o.y - y * o.x); }\r
}\r
\r
class sLink {\r
  id = 0;\r
  source = 0;\r
  dest = 0;\r
  flavor = 0;\r
\r
  constructor(linkId = 0) {\r
    if (typeof linkId == "table" || typeof linkId == "instance") {\r
      id = ("id" in linkId) ? linkId.id : 0;\r
      source = ("source" in linkId) ? linkId.source : (("from" in linkId) ? linkId.from : 0);\r
      dest = ("dest" in linkId) ? linkId.dest : (("to" in linkId) ? linkId.to : 0);\r
      flavor = ("flavor" in linkId) ? linkId.flavor : (("kind" in linkId) ? linkId.kind : 0);\r
    } else {\r
      id = linkId;\r
      local data = LinkTools.LinkGet(linkId);\r
      if (data != null) {\r
        source = ("source" in data) ? data.source : (("from" in data) ? data.from : 0);\r
        dest = ("dest" in data) ? data.dest : (("to" in data) ? data.to : 0);\r
        flavor = ("flavor" in data) ? data.flavor : (("kind" in data) ? data.kind : 0);\r
      }\r
    }\r
  }\r
\r
  function From() { return source; }\r
  function To() { return dest; }\r
  function Kind() { return flavor; }\r
  function ID() { return id; }\r
}\r
\r
class sLinkSet {\r
  ids = null;\r
  cursor = 0;\r
\r
  constructor(values = null) {\r
    ids = [];\r
    if (values != null) {\r
      foreach (value in values) ids.append(value);\r
    }\r
  }\r
\r
  function AnyLinksLeft() { return cursor < ids.len(); }\r
  function Link() { return AnyLinksLeft() ? ids[cursor] : 0; }\r
  function NextLink() { cursor++; }\r
  function _nexti(prev) {\r
    if (prev == null) return ids.len() > 0 ? 0 : null;\r
    local next = prev + 1;\r
    return next < ids.len() ? next : null;\r
  }\r
  function _get(index) { return ids[index]; }\r
  function len() { return ids.len(); }\r
}\r
\r
class int_ref {\r
  value = 0;\r
  constructor(v = 0) { value = v; }\r
  function tointeger() { return value.tointeger(); }\r
  function tofloat() { return value.tofloat(); }\r
  function tostring() { return value.tostring(); }\r
  function _tostring() { return tostring(); }\r
}\r
class float_ref extends int_ref { constructor(v = 0.0) { value = v; } }\r
class string extends int_ref {
  constructor(v = "") { value = v; }
  function _add(other) { return value + other; }
}
\r
// Instances cannot be enumerated by sq_next. Serialize value types explicitly;\r
// engine-owned callbacks use a separate retained-handle contract.\r
function __dark_to_host(value) {\r
  if (value instanceof vector) return { x = value.x, y = value.y, z = value.z, __sq_type = "vector" };\r
  if (value instanceof int_ref) return { value = value.value };\r
  if (value instanceof sLink) return { id = value.id, source = value.source, dest = value.dest, flavor = value.flavor };\r
  if (typeof value == "array") {\r
    local result = [];\r
    foreach (item in value) result.append(__dark_to_host(item));\r
    return result;\r
  }\r
  if (typeof value == "table") {\r
    local result = {};\r
    foreach (key, item in value) result[key] <- __dark_to_host(item);\r
    return result;\r
  }\r
  return value;\r
}\r
\r
function __dark_invoke(serviceName, methodName, args) {\r
  local result = __dark_call(serviceName, methodName, __dark_to_host(args));\r
  if (typeof result == "table" && "__sq_outputs" in result) {\r
    foreach (output in result.__sq_outputs) {\r
      local target = args[output.index];\r
      if (target != null) foreach (key, value in output.value) {\r
        if (key != "__sq_type") target[key] = value;\r
      }\r
    }\r
    result = result.value;\r
  }\r
  return __dark_from_host(result);\r
}\r
\r
function __dark_from_host(value) {\r
  if (typeof value == "table" && "__sq_type" in value) {\r
    if (value.__sq_type == "vector") return vector(value);\r
    if (value.__sq_type == "linkset") return sLinkSet(value.ids);\r
    if (value.__sq_type == "link") return sLink(value);\r
  }\r
  return value;\r
}\r
\r
function object(value) {\r
  if (typeof value == "string") return Object.Named(value);\r
  if (typeof value == "integer" || typeof value == "float") return value.tointeger();\r
  if (typeof value == "instance" && "tointeger" in value) return value.tointeger();\r
  return 0;\r
}\r
\r
function __dark_make_method(serviceName, methodName) {\r
  return function(...) {\r
    return __dark_invoke(serviceName, methodName, vargv);\r
  };\r
}\r
\r
function __dark_install_service(serviceName, methods) {\r
  local service = {};\r
  foreach (methodName in methods) {\r
    service[methodName] <- __dark_make_method(serviceName, methodName);\r
  }\r
  getroottable()[serviceName] <- service;\r
}\r
\r
class SqRootScript {\r
  self = 0;\r
\r
  function GetClassName() { return typeof this; }\r
  function message() { return __dark_get_message(); }\r
  function MessageIs(name) { local m = message(); return m && m.message.tolower() == name.tolower(); }\r
  function BlockMessage() { return __dark_invoke("SqRootScript", "BlockMessage", []); }\r
  function Reply(value = null) { return __dark_invoke("SqRootScript", "Reply", [value]); }\r
  function ReplyWithObj(value = null) { return __dark_invoke("SqRootScript", "ReplyWithObj", [value]); }\r
  function SendMessage(to, msg, data = null, data2 = null, data3 = null) { return __dark_invoke("SqRootScript", "SendMessage", [to, msg, data, data2, data3]); }\r
  function PostMessage(to, msg, data = null, data2 = null, data3 = null) { return __dark_invoke("SqRootScript", "PostMessage", [to, msg, data, data2, data3]); }\r
  function SetOneShotTimer(a, b, c = null, d = null) { return __dark_invoke("SqRootScript", "SetOneShotTimer", [a, b, c, d]); }\r
  function KillTimer(handle) { return __dark_invoke("SqRootScript", "KillTimer", [handle]); }\r
  function GetTime() { return __dark_invoke("SqRootScript", "GetTime", []); }\r
  function HasProperty(prop) { return __dark_invoke("SqRootScript", "HasProperty", [prop]); }\r
  function GetProperty(prop, field = null) { return __dark_invoke("SqRootScript", "GetProperty", [prop, field]); }\r
  function SetProperty(...) { return __dark_invoke("SqRootScript", "SetProperty", vargv); }\r
  function IsDataSet(name) { return __dark_invoke("SqRootScript", "IsDataSet", [name]); }\r
  function GetData(name) { return __dark_invoke("SqRootScript", "GetData", [name]); }\r
  function SetData(name, value = null) { return __dark_invoke("SqRootScript", "SetData", [name, value]); }\r
  function ClearData(name) { return __dark_invoke("SqRootScript", "ClearData", [name]); }\r
  function ObjID(name) { return __dark_invoke("SqRootScript", "ObjID", [name]); }\r
  function linkkind(name) { return __dark_invoke("SqRootScript", "linkkind", [name]); }\r
  function LinkDest(id) { return __dark_invoke("SqRootScript", "LinkDest", [id]); }\r
  function userparams() { return __dark_get_userparams(); }\r
}\r
\r
// Overlay base class. Methods are implemented by user script subclasses.\r
class IDarkOverlayHandler {}\r
\r
__dark_install_service("Version", ["GetAppName", "GetVersion", "IsEditor", "GetGame", "GetGamsys", "GetMap", "GetCurrentFM", "GetCurrentFMPath", "FMizeRelativePath", "FMizePath"]);\r
__dark_install_service("Engine", ["ConfigIsDefined", "ConfigGetInt", "ConfigGetFloat", "ConfigGetRaw", "BindingGetFloat", "FindFileInPath", "IsRunningDX6", "GetCanvasSize", "GetAspectRatio", "GetFog", "SetFog", "GetFogZone", "SetFogZone", "GetWeather", "SetWeather", "PortalRaycast", "ObjRaycast", "SetEnvMapZone"]);\r
__dark_install_service("Object", ["BeginCreate", "EndCreate", "Create", "Destroy", "Exists", "SetName", "GetName", "Named", "AddMetaProperty", "RemoveMetaProperty", "HasMetaProperty", "InheritsFrom", "IsTransient", "SetTransience", "Position", "Facing", "Teleport", "IsPositionValid", "FindClosestObjectNamed", "AddMetaPropertyToMany", "RemoveMetaPropertyFromMany", "RenderedThisFrame", "ObjectToWorld", "WorldToObject", "CalcRelTransform", "Archetype"]);\r
__dark_install_service("Property", ["Get", "Set", "SetSimple", "SetLocal", "Add", "Remove", "CopyFrom", "Possessed"]);\r
__dark_install_service("Physics", ["SubscribeMsg", "UnsubscribeMsg", "LaunchProjectile", "SetVelocity", "GetVelocity", "ControlVelocity", "StopControlVelocity", "SetGravity", "GetGravity", "HasPhysics", "IsSphere", "IsOBB", "ControlCurrentLocation", "ControlCurrentRotation", "ControlCurrentPosition", "DeregisterModel", "PlayerMotionSetOffset", "Activate", "ValidPos", "IsRope", "GetClimbingObject"]);\r
__dark_install_service("Link", ["Create", "Destroy", "AnyExist", "GetAll", "GetOne", "BroadcastOnAllLinks", "BroadcastOnAllLinksData", "CreateMany", "DestroyMany", "GetAllInherited", "GetAllInheritedSingle"]);\r
__dark_install_service("LinkTools", ["LinkKindNamed", "LinkKindName", "LinkGet", "LinkGetData", "LinkSetData"]);\r
__dark_install_service("ActReact", ["React", "Stimulate", "GetReactionNamed", "GetReactionName", "SubscribeToStimulus", "UnsubscribeToStimulus", "BeginContact", "EndContact", "SetSingleSensorContact"]);\r
__dark_install_service("Data", ["GetString", "GetObjString", "DirectRand", "RandInt", "RandFlt0to1", "RandFltNeg1to1"]);\r
__dark_install_service("AI", ["MakeGotoObjLoc", "MakeFrobObjWith", "MakeFrobObj", "GetAlertLevel", "SetMinimumAlert", "ClearGoals", "SetScriptFlags", "ClearAlertness", "Signal", "StartConversation"]);\r
__dark_install_service("Sound", ["PlayAtLocation", "PlayAtObject", "Play", "PlayAmbient", "PlaySchemaAtLocation", "PlaySchemaAtObject", "PlaySchema", "PlaySchemaAmbient", "PlayEnvSchema", "PlayVoiceOver", "Halt", "HaltSchema", "HaltSpeech", "PreLoad"]);\r
__dark_install_service("AnimTexture", ["ChangeTexture"]);\r
__dark_install_service("PGroup", ["SetActive"]);\r
__dark_install_service("Camera", ["StaticAttach", "DynamicAttach", "CameraReturn", "ForceCameraReturn", "GetCameraParent", "IsRemote", "GetPosition", "GetFacing", "CameraToWorld", "WorldToCamera"]);\r
__dark_install_service("Light", ["Set", "SetMode", "Activate", "Deactivate", "Subscribe", "Unsubscribe", "GetMode"]);\r
__dark_install_service("Door", ["CloseDoor", "OpenDoor", "GetDoorState", "ToggleDoor", "SetBlocking", "GetSoundBlocking"]);\r
__dark_install_service("Damage", ["Damage", "Slay", "Resurrect"]);\r
__dark_install_service("Container", ["Add", "Remove", "MoveAllContents", "StackAdd", "IsHeld"]);\r
__dark_install_service("Quest", ["SubscribeMsg", "UnsubscribeMsg", "Set", "Get", "Exists", "Delete", "GetAllVars", "BinSet", "BinGet", "BinSetTable", "BinGetTable", "BinExists", "BinDelete"]);\r
__dark_install_service("Puppet", ["PlayMotion"]);\r
__dark_install_service("Locked", ["IsLocked"]);\r
__dark_install_service("Key", ["TryToUseKey"]);\r
__dark_install_service("Networking", ["Broadcast", "SendToProxy", "TakeOver", "GiveTo", "IsPlayer", "IsMultiplayer", "SetProxyOneShotTimer", "FirstPlayer", "NextPlayer", "Suspend", "Resume", "HostedHere", "IsProxy", "LocalOnly", "IsNetworking", "Owner"]);\r
__dark_install_service("CD", ["SetBGM", "SetTrack"]);\r
__dark_install_service("Debug", ["MPrint", "Command", "Break", "Log"]);\r
__dark_install_service("DarkGame", ["KillPlayer", "EndMission", "FadeToBlack", "FoundObject", "ConfigIsDefined", "ConfigGetInt", "ConfigGetFloat", "BindingGetFloat", "GetAutomapLocationVisited", "SetAutomapLocationVisited", "SetNextMission", "GetCurrentMission", "RespawnPlayer", "FadeIn"]);\r
__dark_install_service("DarkUI", ["TextMessage", "ReadBook", "InvItem", "InvWeapon", "InvSelect", "IsCommandBound", "DescribeKeyBinding"]);\r
__dark_install_service("PickLock", ["Ready", "UnReady", "StartPicking", "FinishPicking", "CheckPick", "DirectMotion"]);\r
__dark_install_service("DrkInv", ["CapabilityControl", "AddSpeedControl", "RemoveSpeedControl"]);\r
__dark_install_service("DrkPowerups", ["TriggerWorldFlash", "ObjTryDeploy", "CleanseBlood"]);\r
__dark_install_service("PlayerLimbs", ["Equip", "UnEquip", "StartUse", "FinishUse"]);\r
__dark_install_service("Weapon", ["Equip", "UnEquip", "IsEquipped", "StartAttack", "FinishAttack"]);\r
__dark_install_service("Bow", ["Equip", "UnEquip", "IsEquipped", "StartAttack", "FinishAttack", "AbortAttack", "SetArrow"]);\r
__dark_install_service("DarkOverlay", ["AddHandler", "RemoveHandler", "GetBitmap", "FlushBitmap", "GetBitmapSize", "WorldToScreen", "GetObjectScreenBounds", "CreateTOverlayItem", "CreateTOverlayItemFromBitmap", "DestroyTOverlayItem", "UpdateTOverlayAlpha", "UpdateTOverlayPosition", "UpdateTOverlaySize", "DrawBitmap", "DrawSubBitmap", "SetTextColorFromStyle", "SetTextColor", "GetStringSize", "DrawString", "DrawLine", "FillTOverlay", "BeginTOverlayUpdate", "EndTOverlayUpdate", "DrawTOverlayItem"]);\r
\r
function GetAPIVersion() { return 10; }\r
function GetDarkGame() { return 0; }\r
function IsEditor() { return 0; }\r
\r
TRUE <- true;\r
FALSE <- false;\r
S_OK <- 0;\r
\r
eDarkGame <- { kDarkGameThief = 0, kDarkGameShock = 1, kDarkGameThief2 = 2 };\r
eDoorStatus <- { kDoorClosed = 0, kDoorOpen = 1, kDoorClosing = 2, kDoorOpening = 3, kDoorHalt = 4, kDoorHalted = 4, kDoorNoDoor = 5 };\r
eGoalState <- { kGoalIncomplete = 0, kGoalComplete = 1, kGoalInactive = 2, kGoalFailed = 3 };\r
eTweqType <- { kTweqTypeScale = 0, kTweqTypeRotate = 1, kTweqTypeJoints = 2, kTweqTypeModels = 3, kTweqTypeDelete = 4, kTweqTypeEmitter = 5, kTweqTypeFlicker = 6, kTweqTypeLock = 7, kTweqTypeAll = 8, kTweqTypeNull = 9 };\r
eTweqDirection <- { kTweqDirForward = 0, kTweqDirReverse = 1 };\r
eTweqDo <- { kTweqDoDefault = 0, kTweqDoActivate = 1, kTweqDoHalt = 2, kTweqDoReset = 3, kTweqDoContinue = 4, kTweqDoForward = 5, kTweqDoReverse = 6 };\r
eSlayResult <- { kSlayNormal = 0, kSlayNoEffect = 1, kSlayTerminate = 2, kSlayDestroy = 3 };\r
eDamageResult <- { kDamageTerminate = 0, kDamageNoWound = 1, kDamageWound = 2, kDamageSlay = 3 };\r
eContainsEvent <- { kContainAdd = 1, kContainRemove = 2 };\r
eAIActionPriority <- { kLowPriorityAction = 0, kNormalPriorityAction = 1, kHighPriorityAction = 2 };\r
eAIMode <- { kAIM_Asleep = 0, kAIM_SuperEfficient = 1, kAIM_Efficient = 2, kAIM_Normal = 3, kAIM_Combat = 4, kAIM_Dead = 5, kAIM_Num = 6 };\r
eAIScriptSpeed <- { kSlow = 0, kNormalSpeed = 1, kFast = 2 };\r
eEnvSoundLoc <- { kEnvSoundOnObj = 0, kEnvSoundAtObjLoc = 1, kEnvSoundAmbient = 2 };\r
eQuestDataType <- { kQuestDataMission = 0, kQuestDataCampaign = 1, kQuestDataUnknown = 2 };\r
ePhysScriptMsgType <- { kNoMsg = 0, kCollisionMsg = 1, kContactMsg = 2, kEnterExitMsg = 4, kFellAsleepMsg = 8, kWokeUpMsg = 16, kMadePhysMsg = 256, kMadeNonPhysMsg = 512, kAllMsgs = 7 };\r
ePhysCollisionType <- { kCollNone = 0, kCollTerrain = 1, kCollObject = 2 };\r
ePhysContactType <- { kContactNone = 0, kContactFace = 1, kContactEdge = 2, kContactVertex = 4, kContactSphere = 8, kContactSphereHat = 16, kContactOBB = 32, kContactTerrain = 7, kContactObject = 56 };\r
ePhysContact <- { kContactCreate = 0, kContactDestroy = 1 };\r
ePhysEnterExit <- { kEnter = 0, kExit = 1 };\r
ePhysMessageResult <- { kPM_StatusQuo = 0, kPM_Nothing = 1, kPM_Bounce = 2, kPM_Slay = 3, kPM_NonPhys = 4 };\r
`;export{e as default};
