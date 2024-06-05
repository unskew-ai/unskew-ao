--[[
    Imports
]] --

local json = require("json")
local ao = require("ao")

--[[
  This module implements the unskew.ai protocol on AO

  Terms:
    Sender: the wallet or Process that sent the Message

  It will first initialize the internal state, define utils code blocks and then attach handlers.

    - Info(): return process metadata: Name, and EventsCount.

    - GetState(): getter -- return the table of all events.

    - GetEventById(EventId: String): getter -- return the event for the given ID.

    - IndexResponse(Data: string): if the Sender provide a format-correct event instance, it will add it to the
    State table. Sender should be equal to Admin defined in the internal state.

]]
--

--[[
  internal state
]]
--
State = State or {};
Name = Name or "unskew.ai";
Admin = Admin or "aP7IWOaR5wW02BpH4-s5wRsrCsmfI4XhoW2JmPo5GwU"; 

--[[
  utils helper functions
]]
--

-- The aikek res template
local template = {
    event = "string",
    project = "string",
    project_token = "string",
    project_description = "string",
    project_industry = "string",
    source = "string",
    source_url = "string",
    time = "string",
    bullishness = "number",
    legitimacy = "number",
    rawdata = "string",
}

-- Function to check the type of each key in the object
local function checkType(value, expectedType)
    if expectedType == "table" then
        return type(value) == "table"
    else
        return type(value) == expectedType
    end
end

-- Function to validate an object against the survey template
local function validateInstance(instance, tmpl)
    for key, expectedType in pairs(tmpl) do
        local value = instance[key]
        if type(expectedType) == "table" then
            if type(value) ~= "table" then
                return false, key .. " is not a table"
            end
            for i, v in ipairs(value) do
                local valid, err = validateInstance(v, expectedType[1])
                if not valid then
                    return false, key .. "[" .. i .. "]: " .. err
                end
            end
        else
            if not checkType(value, expectedType) then
                return false, key .. " is not of type " .. expectedType
            end
        end
    end
    return true
end

-- Function to find an event with a specific id
local function find_event_by_id(v)
    for i, inner_table in ipairs(Surveys) do
        if inner_table["event_id"] == v then
            return inner_table
        end
    end
    return nil -- Return nil if not found
end

--[[
     Add handlers for each incoming Action
   ]]
--

--[[
     Info
   ]]
--
Handlers.add(
    "info",
    Handlers.utils.hasMatchingTag("Action", "Info"),
    function(msg)
        ao.send(
            {
                Target = msg.From,
                Tags = {
                    Name = Name,
                    EventsCount = #Survey
                }
            }
        )
    end
)
--[[
     GetState
   ]]
--
Handlers.add(
    "getState",
    Handlers.utils.hasMatchingTag("Action", "GetState"),
    function(msg)
        ao.send({Target = msg.From, Data = json.encode(State)})
    end
)

--[[
     getEventById
   ]]
--
Handlers.add(
    "getEventById",
    Handlers.utils.hasMatchingTag("Action", "GetEventById"),
    function(msg)
        local event_id = msg.Tags.EventId
        assert(type(event_id) == "string", "ERROR_INVALID_EVENT_ID")
        ao.send(
            {
                Target = msg.From,
                Data = json.encode(State[event_id])
            }
        )
    end
)

--[[
     IndexResponse
   ]]
--
Handlers.add(
    "indexResponse",
    Handlers.utils.hasMatchingTag("Action", "IndexResponse"),
    function(msg)
        local res = json.decode(msg.Data)
        local valid, err = validateInstance(res, template)
        assert(valid, "ERROR_INVALID_RES_TEMPLATE")

        if msg.From == Admin then 
        
            res["event_id"] = msg.Id
            res["sender"] = msg.From

            table.insert(State, res)
            ao.send(
                {
                    Target = msg.From,
                    Tags = {
                        Action = "UnskewAI-Data-Indexed"
                    }
                }
            )
        end

    end
)
