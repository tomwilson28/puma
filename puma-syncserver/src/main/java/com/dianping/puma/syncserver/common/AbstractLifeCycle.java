package com.dianping.puma.syncserver.common;

public abstract class AbstractLifeCycle implements LifeCycle {

	private volatile boolean stopped = true;

	@Override
	public void start() {
		if (!checkStop()) {
			return;
		}

		doStart();
		stopped = false;
	}

	@Override
	public void stop() {
		if (checkStop()) {
			return;
		}

		stopped = true;
		doStop();
	}

	protected abstract void doStart();

	protected abstract void doStop();

	protected boolean checkStop() {
		return stopped || Thread.currentThread().isInterrupted();
	}
}