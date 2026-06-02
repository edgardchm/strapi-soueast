import React, { useEffect } from 'react';
import pluginId from '../pluginId';

const Initializer = ({ setPlugin }) => {
  useEffect(() => {
    setPlugin(pluginId, pluginId);
  }, [setPlugin]);

  return null;
};

export default Initializer;
